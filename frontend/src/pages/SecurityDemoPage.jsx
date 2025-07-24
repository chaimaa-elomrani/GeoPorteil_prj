import React from 'react'
import SecurityDemo from '../components/security/SecurityDemo'

const SecurityDemoPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🔒 Security Implementation Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            This page demonstrates the security enhancements implemented in the authentication system.
            You can see how data is encrypted in localStorage and compare it with plain text storage.
          </p>
        </div>
        
        <SecurityDemo />
        
        <div className="mt-12 text-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🛡️ Security Features Active</h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">🍪 HttpOnly Cookies</h3>
                <p className="text-green-700 text-sm">
                  Authentication tokens stored in secure, JavaScript-inaccessible cookies
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">🔐 AES Encryption</h3>
                <p className="text-blue-700 text-sm">
                  Any localStorage data is encrypted with AES-256 using unique keys
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">🗑️ Secure Logout</h3>
                <p className="text-purple-700 text-sm">
                  Complete data cleanup removes all traces of user information
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SecurityDemoPage
