const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const clientSchema = new Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    quality: String,
    identityPiece: String,
    identificationNumber: { 
      type: String, 
      trim: true,
      sparse: true, // Allows multiple null values but unique non-null values
      index: true
    },
    identityDocument: Array,
    region: String,
    city: String,
    common: String,
    address: String,
    postalCode: String,
    phoneNumber: Array,
    email: { 
      type: String, 
      trim: true, 
      lowercase: true,
      sparse: true, // Allows multiple null values but unique non-null values
      index: true
    },
    websiteUrl: String,
    note: String,
    communes: String,
    organization: { type: String, trim: true },
    legalForm: String,
    businessRegistration: { 
      type: String, 
      trim: true,
      sparse: true,
      index: true
    },
    taxIdentification: String,
    taxIdentificationNumber: String,
    representative: String,
    RCN: { 
      type: String, 
      trim: true,
      sparse: true,
      index: true
    },
    ICE: { 
      type: String, 
      trim: true,
      sparse: true, // Allows multiple null values but unique non-null values
      index: true
    },
    IF: { 
      type: String, 
      trim: true,
      sparse: true,
      index: true
    },
    prefectureProvince: String,
    serviceType: String,
    marketType: String,
    establishment: String,
    purchaseOrder: String,
    convention: String,
    appelOffreNumber: String,
    date: Date,
    // archive
    isArchived: { type: Boolean, default: false },
    // black list
    isBlacklisted: { type: Boolean, default: false },
    balckListedRaison: { type: String, default: null },
    balckListedAt: { type: Date, default: null },
    // rep fields
    repAddress: String,
    repCommunes: String,
    repCity: String,
    repDentityPiece: String,
    repIdentityDocument: Array,
    repEmail: { type: String, trim: true, lowercase: true },
    repFirstName: String,
    repIdentificationNumber: String,
    repLastName: String,
    repPostalCode: String,
    repQuality: String,
    repRegion: String,
    repWebsiteUrl: String,
    repPhoneNumber: Array,
    repNote: String,
  },
  {
    timestamps: true,
  }
);

// Create compound indexes for better duplicate detection
clientSchema.index({ email: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { email: { $exists: true, $ne: null, $ne: "" } }
});

clientSchema.index({ ICE: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { ICE: { $exists: true, $ne: null, $ne: "" } }
});

clientSchema.index({ identificationNumber: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { identificationNumber: { $exists: true, $ne: null, $ne: "" } }
});

clientSchema.index({ businessRegistration: 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { businessRegistration: { $exists: true, $ne: null, $ne: "" } }
});

const Client = model("Client", clientSchema);
module.exports = Client;
