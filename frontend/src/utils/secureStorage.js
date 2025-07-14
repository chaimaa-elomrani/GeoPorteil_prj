import CryptoJS from 'crypto-js';

/**
 * Secure Storage Utility with AES Encryption
 * Prevents sensitive data from being readable in localStorage
 */
class SecureStorage {
  constructor() {
    // Generate a unique encryption key based on browser fingerprint
    // In production, you might want to derive this from user session or server
    this.encryptionKey = this.generateEncryptionKey();
  }

  /**
   * Generate a unique encryption key for this browser session
   * This makes the encrypted data unique per browser/session
   */
  generateEncryptionKey() {
    // Create a fingerprint based on browser characteristics
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.platform
    ].join('|');
    
    // Use a combination of fingerprint and a secret
    const secret = 'geoporteil-secure-key-2024'; // In production, this should be from env
    return CryptoJS.SHA256(fingerprint + secret).toString();
  }

  /**
   * Encrypt data using AES encryption
   */
  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return null;
    }
  }

  /**
   * Decrypt data using AES decryption
   */
  decrypt(encryptedData) {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Store encrypted data in localStorage
   */
  setItem(key, value) {
    try {
      const encrypted = this.encrypt(value);
      if (encrypted) {
        localStorage.setItem(`sec_${key}`, encrypted);
        return true;
      }
      return false;
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      return false;
    }
  }

  /**
   * Retrieve and decrypt data from localStorage
   */
  getItem(key) {
    try {
      const encrypted = localStorage.getItem(`sec_${key}`);
      if (!encrypted) return null;
      
      return this.decrypt(encrypted);
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key) {
    try {
      localStorage.removeItem(`sec_${key}`);
      return true;
    } catch (error) {
      console.error('SecureStorage removeItem error:', error);
      return false;
    }
  }

  /**
   * Clear all secure storage items
   */
  clear() {
    try {
      // Get all localStorage keys that start with 'sec_'
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sec_')) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all secure storage items
      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('SecureStorage clear error:', error);
      return false;
    }
  }

  /**
   * Store JWT token securely
   * Note: For maximum security, use HttpOnly cookies instead
   */
  setToken(token) {
    return this.setItem('auth_token', token);
  }

  /**
   * Retrieve JWT token
   */
  getToken() {
    return this.getItem('auth_token');
  }

  /**
   * Store minimal user info (encrypted)
   * Only store what's absolutely necessary for UI
   */
  setUserInfo(userInfo) {
    // Only store non-sensitive display information
    const safeUserInfo = {
      id: userInfo.id,
      role: userInfo.role,
      initials: this.generateInitials(userInfo.nom, userInfo.prenom),
      // Don't store full name, email, or other sensitive data
    };
    
    return this.setItem('user_info', safeUserInfo);
  }

  /**
   * Get user info
   */
  getUserInfo() {
    return this.getItem('user_info');
  }

  /**
   * Generate user initials for display
   */
  generateInitials(nom, prenom) {
    if (!nom || !prenom) return 'U';
    return (nom.charAt(0) + prenom.charAt(0)).toUpperCase();
  }

  /**
   * Secure logout - clear all data
   */
  secureLogout() {
    // Clear all secure storage
    this.clear();
    
    // Clear any remaining localStorage items
    localStorage.clear();
    
    // Clear sessionStorage as well
    sessionStorage.clear();
    
    console.log('🔒 Secure logout completed - all local data cleared');
  }
}

// Create a singleton instance
const secureStorage = new SecureStorage();

export default secureStorage;
