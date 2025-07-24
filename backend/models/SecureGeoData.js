const mongoose = require('mongoose')
const crypto = require('crypto')

// Encryption configuration
const ENCRYPTION_KEY = process.env.GEO_ENCRYPTION_KEY || crypto.randomBytes(32) // 32 bytes key
const IV_LENGTH = 16 // For AES, this is always 16

// Encryption functions
const encrypt = (text) => {
  if (!text) return null
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
  let encrypted = cipher.update(JSON.stringify(text), 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

const decrypt = (encryptedData) => {
  if (!encryptedData) return null
  try {
    const textParts = encryptedData.split(':')
    const iv = Buffer.from(textParts.shift(), 'hex')
    const encryptedText = textParts.join(':')
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return JSON.parse(decrypted)
  } catch (error) {
    console.error('Decryption error:', error)
    return null
  }
}

// Secure GeoData Schema
const SecureGeoDataSchema = new mongoose.Schema({
  // Project identification
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  
  // Data classification
  dataType: {
    type: String,
    enum: ['geojson', 'survey_data', 'building_data', 'resident_data'],
    required: true,
    index: true
  },
  
  // Security level
  securityLevel: {
    type: String,
    enum: ['public', 'internal', 'confidential', 'restricted'],
    default: 'confidential',
    index: true
  },
  
  // Encrypted data storage
  encryptedData: {
    type: String,
    required: true
  },
  
  // Metadata (non-sensitive)
  metadata: {
    totalFeatures: Number,
    dataSize: Number,
    lastModified: Date,
    checksum: String,
    version: { type: String, default: '1.0' }
  },
  
  // Access control
  accessControl: {
    allowedRoles: [{
      type: String,
      enum: ['admin', 'manager', 'surveyor', 'viewer']
    }],
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    restrictedFields: [String] // Fields that require higher permissions
  },
  
  // Audit trail
  auditLog: [{
    action: {
      type: String,
      enum: ['created', 'accessed', 'modified', 'exported', 'deleted']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    details: String
  }],
  
  // Data retention
  retentionPolicy: {
    expiresAt: Date,
    archiveAfter: Date,
    deleteAfter: Date
  }
}, {
  timestamps: true,
  collection: 'secure_geodata'
})

// Indexes for performance and security
SecureGeoDataSchema.index({ projectId: 1, dataType: 1 })
SecureGeoDataSchema.index({ securityLevel: 1 })
SecureGeoDataSchema.index({ 'accessControl.allowedRoles': 1 })
SecureGeoDataSchema.index({ 'accessControl.allowedUsers': 1 })
SecureGeoDataSchema.index({ createdAt: -1 })

// Virtual for decrypted data (not stored in DB)
SecureGeoDataSchema.virtual('data').get(function() {
  return decrypt(this.encryptedData)
})

// Method to encrypt and store data
SecureGeoDataSchema.methods.setData = function(data) {
  this.encryptedData = encrypt(data)
  
  // Update metadata
  this.metadata.dataSize = JSON.stringify(data).length
  this.metadata.lastModified = new Date()
  this.metadata.checksum = crypto.createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex')
  
  return this
}

// Method to log access
SecureGeoDataSchema.methods.logAccess = function(action, userId, ipAddress, userAgent, details) {
  this.auditLog.push({
    action,
    userId,
    timestamp: new Date(),
    ipAddress,
    userAgent,
    details
  })
  
  // Keep only last 100 audit entries
  if (this.auditLog.length > 100) {
    this.auditLog = this.auditLog.slice(-100)
  }
  
  return this.save()
}

// Static method to check access permissions
SecureGeoDataSchema.statics.checkAccess = function(userId, userRole, securityLevel) {
  const accessMatrix = {
    'public': ['admin', 'manager', 'surveyor', 'viewer'],
    'internal': ['admin', 'manager', 'surveyor'],
    'confidential': ['admin', 'manager'],
    'restricted': ['admin']
  }
  
  return accessMatrix[securityLevel]?.includes(userRole) || false
}

// Static method to find accessible data
SecureGeoDataSchema.statics.findAccessible = function(userId, userRole, filters = {}) {
  const accessibleLevels = []
  
  if (['admin', 'manager', 'surveyor', 'viewer'].includes(userRole)) {
    accessibleLevels.push('public')
  }
  if (['admin', 'manager', 'surveyor'].includes(userRole)) {
    accessibleLevels.push('internal')
  }
  if (['admin', 'manager'].includes(userRole)) {
    accessibleLevels.push('confidential')
  }
  if (userRole === 'admin') {
    accessibleLevels.push('restricted')
  }
  
  return this.find({
    ...filters,
    $or: [
      { securityLevel: { $in: accessibleLevels } },
      { 'accessControl.allowedUsers': userId }
    ]
  })
}

// Pre-save middleware for validation
SecureGeoDataSchema.pre('save', function(next) {
  // Ensure data is encrypted
  if (!this.encryptedData) {
    return next(new Error('Data must be encrypted before saving'))
  }
  
  // Set default access control
  if (!this.accessControl.allowedRoles.length) {
    this.accessControl.allowedRoles = ['admin', 'manager']
  }
  
  next()
})

// Export model
module.exports = mongoose.model('SecureGeoData', SecureGeoDataSchema)
