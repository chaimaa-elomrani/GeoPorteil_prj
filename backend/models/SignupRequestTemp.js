// Temporary in-memory storage for testing
class SignupRequestTemp {
  constructor(data) {
    this.email = data.email;
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.status = 'pending';
    this.requestDate = new Date();
    this._id = Date.now().toString(); // Simple ID
  }

  async save() {
    console.log('SignupRequest saved (in memory):', this);
    return this;
  }

  static async findOne(query) {
    // Always return null (no existing requests)
    return null;
  }
}

module.exports = SignupRequestTemp;