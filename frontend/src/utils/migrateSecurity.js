import secureStorage from './secureStorage';

/**
 * Security Migration Utility
 * Migrates existing plain text localStorage data to encrypted storage
 */
class SecurityMigration {
  
  /**
   * Migrate existing user data from plain text to encrypted storage
   */
  static migrateUserData() {
    try {
      console.log('🔒 Starting security migration...');
      
      // Check for existing plain text user data
      const plainTextUser = localStorage.getItem('user');
      const plainTextToken = localStorage.getItem('token');
      
      if (plainTextUser) {
        try {
          const userData = JSON.parse(plainTextUser);
          console.log('📦 Found plain text user data, migrating to encrypted storage...');
          
          // Store in encrypted format
          secureStorage.setUserInfo(userData);
          
          // Remove plain text version
          localStorage.removeItem('user');
          
          console.log('✅ User data migrated successfully');
        } catch (error) {
          console.error('❌ Error migrating user data:', error);
          // Remove corrupted data
          localStorage.removeItem('user');
        }
      }
      
      if (plainTextToken) {
        console.log('🔑 Found plain text token, migrating to encrypted storage...');
        
        // Store token in encrypted format
        secureStorage.setToken(plainTextToken);
        
        // Remove plain text version
        localStorage.removeItem('token');
        
        console.log('✅ Token migrated successfully');
      }
      
      // Clean up any other sensitive data that might be in plain text
      this.cleanupSensitiveData();
      
      console.log('🎉 Security migration completed');
      
    } catch (error) {
      console.error('❌ Security migration failed:', error);
    }
  }
  
  /**
   * Clean up any sensitive data that might be stored in plain text
   */
  static cleanupSensitiveData() {
    const sensitiveKeys = [
      'authToken',
      'accessToken',
      'refreshToken',
      'userProfile',
      'userData',
      'loginData',
      'sessionData',
      'credentials'
    ];
    
    let cleanedCount = 0;
    
    sensitiveKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        cleanedCount++;
        console.log(`🧹 Cleaned up sensitive key: ${key}`);
      }
    });
    
    if (cleanedCount > 0) {
      console.log(`✅ Cleaned up ${cleanedCount} sensitive localStorage items`);
    }
  }
  
  /**
   * Audit current localStorage for security issues
   */
  static auditLocalStorage() {
    console.log('🔍 Auditing localStorage for security issues...');
    
    const audit = {
      totalItems: localStorage.length,
      plainTextItems: [],
      encryptedItems: [],
      sensitiveData: [],
      recommendations: []
    };
    
    // Check all localStorage items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      // Check if it's encrypted (our encrypted items start with 'sec_')
      if (key.startsWith('sec_')) {
        audit.encryptedItems.push(key);
      } else {
        audit.plainTextItems.push(key);
        
        // Check if it contains sensitive information
        if (this.containsSensitiveData(key, value)) {
          audit.sensitiveData.push({
            key,
            reason: this.getSensitiveDataReason(key, value)
          });
        }
      }
    }
    
    // Generate recommendations
    if (audit.sensitiveData.length > 0) {
      audit.recommendations.push('🚨 Sensitive data found in plain text - should be encrypted');
    }
    
    if (audit.plainTextItems.length > audit.encryptedItems.length) {
      audit.recommendations.push('⚠️ More plain text items than encrypted - consider encrypting more data');
    }
    
    if (audit.encryptedItems.length > 0) {
      audit.recommendations.push('✅ Encrypted storage is being used - good security practice');
    }
    
    console.log('📊 Security Audit Results:', audit);
    return audit;
  }
  
  /**
   * Check if a localStorage item contains sensitive data
   */
  static containsSensitiveData(key, value) {
    const sensitivePatterns = [
      /token/i,
      /password/i,
      /email/i,
      /phone/i,
      /address/i,
      /credit/i,
      /card/i,
      /ssn/i,
      /social/i,
      /"id":/,
      /"email":/,
      /"phone":/,
      /"nom":/,
      /"prenom":/,
      /"role":/
    ];
    
    // Check key name
    if (sensitivePatterns.some(pattern => pattern.test(key))) {
      return true;
    }
    
    // Check value content
    if (value && typeof value === 'string') {
      return sensitivePatterns.some(pattern => pattern.test(value));
    }
    
    return false;
  }
  
  /**
   * Get reason why data is considered sensitive
   */
  static getSensitiveDataReason(key, value) {
    if (/token/i.test(key) || /token/i.test(value)) {
      return 'Contains authentication token';
    }
    if (/email/i.test(key) || /"email":/.test(value)) {
      return 'Contains email address';
    }
    if (/phone/i.test(key) || /"phone":/.test(value)) {
      return 'Contains phone number';
    }
    if (/"nom":/.test(value) || /"prenom":/.test(value)) {
      return 'Contains personal name information';
    }
    if (/"id":/.test(value)) {
      return 'Contains user ID';
    }
    return 'Contains potentially sensitive information';
  }
  
  /**
   * Force migration - clears all plain text data and requires re-login
   */
  static forceMigration() {
    console.log('🔒 Starting force migration - clearing all plain text data...');
    
    // Get all localStorage keys
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }
    
    // Remove all non-encrypted items
    keys.forEach(key => {
      if (!key.startsWith('sec_')) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed plain text item: ${key}`);
      }
    });
    
    // Clear sessionStorage as well
    sessionStorage.clear();
    
    console.log('✅ Force migration completed - user will need to re-login');
    
    // Redirect to login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }
}

// Auto-run migration on import
SecurityMigration.migrateUserData();

export default SecurityMigration;
