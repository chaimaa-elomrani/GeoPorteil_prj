const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

class ApiService {
  constructor() {
    this.baseURL = API_URL
  }

  getAuthToken() {
    return localStorage.getItem("token")
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getAuthToken()
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    console.log(`🚀 API Request: ${options.method || "GET"} ${url}`)

    try {
      const response = await fetch(url, config)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("📥 API Response:", data)
      return data
    } catch (error) {
      console.error("❌ API Error:", error)
      throw error
    }
  }

  // Auth methods
  async login(credentials) {
    return this.request("/authRoutes/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request("/admin/stats")
  }

  // Users
  async getAllUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ""}`
    return this.request(endpoint)
  }

  async createUser(userData) {
    return this.request("/admin/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id, userData) {
    return this.request(`/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: "DELETE",
    })
  }

  // Signup Requests
  async getAllSignupRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = `/admin/signup-requests/all${queryString ? `?${queryString}` : ""}`
    return this.request(endpoint)
  }

  // Updated approve signup request method with password and additional info
  async approveSignupRequest(id, data = {}) {
    return this.request(`/admin/signup-requests/${id}/approve`, {
      method: "POST",
      body: JSON.stringify(data), // { password, additionalInfo }
    })
  }

  // Updated reject signup request method with reason
  async rejectSignupRequest(id, data = {}) {
    return this.request(`/admin/signup-requests/${id}/reject`, {
      method: "POST",
      body: JSON.stringify(data), // { reason }
    })
  }

  // User status management
  async suspendUser(id, reason) {
    return this.request(`/admin/users/${id}/suspend`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    })
  }

  async unsuspendUser(id) {
    return this.request(`/admin/users/${id}/unsuspend`, {
      method: "POST",
    })
  }

  // Block/Unblock user methods (if needed)
  async blockUser(id, reason) {
    return this.request(`/admin/users/${id}/block`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    })
  }

  async unblockUser(id) {
    return this.request(`/admin/users/${id}/unblock`, {
      method: "POST",
    })
  }

  // Additional utility methods for signup requests
  async getSignupRequestById(id) {
    return this.request(`/admin/signup-requests/${id}`)
  }

  async getSignupRequestStats() {
    return this.request("/admin/signup-requests/stats")
  }

  // Bulk operations (if you want to implement them later)
  async bulkApproveSignupRequests(requestIds, defaultPassword) {
    return this.request("/admin/signup-requests/bulk-approve", {
      method: "POST",
      body: JSON.stringify({ requestIds, defaultPassword }),
    })
  }

  async bulkRejectSignupRequests(requestIds, reason) {
    return this.request("/admin/signup-requests/bulk-reject", {
      method: "POST",
      body: JSON.stringify({ requestIds, reason }),
    })
  }

  // Email template methods (if you want to allow customization)
  async getEmailTemplates() {
    return this.request("/admin/email-templates")
  }

  async updateEmailTemplate(templateType, templateData) {
    return this.request(`/admin/email-templates/${templateType}`, {
      method: "PUT",
      body: JSON.stringify(templateData),
    })
  }

  // Audit log methods
  async getAuditLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = `/admin/audit-logs${queryString ? `?${queryString}` : ""}`
    return this.request(endpoint)
  }

  // Test email functionality
  async testEmailConfiguration() {
    return this.request("/admin/test-email", {
      method: "POST",
    })
  }

  async sendTestEmail(email) {
    return this.request("/admin/send-test-email", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  }
}

export const apiService = new ApiService()
export default apiService

// Legacy support for your existing code
export async function post(path, data, auth = false) {
  const headers = { "Content-Type": "application/json" }
  if (auth) {
    const token = localStorage.getItem("token")
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  })

  const responseData = await response.json()
  if (!response.ok) {
    throw new Error(responseData.message || `HTTP error! status: ${response.status}`)
  }

  return responseData
}
