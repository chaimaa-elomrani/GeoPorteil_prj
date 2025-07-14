import React, { useState, useEffect } from 'react'
import secureStorage from '../utils/secureStorage'
import SecurityMigration from '../utils/migrateSecurity'
import { useAuth } from '../contexts/AuthContext'

const SecurityDemo = () => {
  const { user } = useAuth()
  const [storageData, setStorageData] = useState({})
  const [encryptedData, setEncryptedData] = useState('')
  const [auditResults, setAuditResults] = useState(null)
  const [testData, setTestData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    sensitiveInfo: 'This is sensitive data that should be encrypted'
  })

  useEffect(() => {
    refreshStorageData()
  }, [])

  const refreshStorageData = () => {
    // Get all localStorage data
    const allData = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      allData[key] = localStorage.getItem(key)
    }
    setStorageData(allData)
  }

  const storeDataPlainText = () => {
    localStorage.setItem('plain_user_data', JSON.stringify(testData))
    refreshStorageData()
  }

  const storeDataEncrypted = () => {
    secureStorage.setItem('encrypted_user_data', testData)
    refreshStorageData()
  }

  const retrieveEncryptedData = () => {
    const data = secureStorage.getItem('encrypted_user_data')
    setEncryptedData(JSON.stringify(data, null, 2))
  }

  const clearAllData = () => {
    secureStorage.secureLogout()
    refreshStorageData()
    setEncryptedData('')
    setAuditResults(null)
  }

  const runSecurityAudit = () => {
    const results = SecurityMigration.auditLocalStorage()
    setAuditResults(results)
  }

  const migrateExistingData = () => {
    SecurityMigration.migrateUserData()
    refreshStorageData()
    runSecurityAudit()
  }

  const forceMigration = () => {
    if (confirm('⚠️ This will clear all plain text data and require re-login. Continue?')) {
      SecurityMigration.forceMigration()
    }
  }

  const showCurrentUserData = () => {
    if (user) {
      setEncryptedData(JSON.stringify({
        'Current User (from secure context)': user,
        'Encrypted Storage': secureStorage.getUserInfo(),
        'User Initials': secureStorage.getUserInfo()?.initials || 'N/A'
      }, null, 2))
    } else {
      setEncryptedData('No user logged in')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">🔒 Security Implementation Demo</h2>

      {/* Current User Status */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">👤 Current User Status</h3>
        {user ? (
          <div className="text-sm text-blue-700">
            <p><strong>Logged in as:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Name:</strong> {user.nom} {user.prenom}</p>
            <p><strong>Storage:</strong> Data is encrypted in localStorage ✅</p>
            <p><strong>Authentication:</strong> Using secure HttpOnly cookies 🍪</p>
          </div>
        ) : (
          <p className="text-blue-700">Not logged in - no user data stored</p>
        )}
      </div>
      
      {/* Test Data Input */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Test Data</h3>
        <textarea
          className="w-full p-3 border rounded-lg"
          rows="4"
          value={JSON.stringify(testData, null, 2)}
          onChange={(e) => {
            try {
              setTestData(JSON.parse(e.target.value))
            } catch (err) {
              // Invalid JSON, ignore
            }
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="mb-8 space-y-4">
        {/* Test Data Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={storeDataPlainText}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
          >
            ❌ Store Plain Text (Insecure)
          </button>
          <button
            onClick={storeDataEncrypted}
            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
          >
            ✅ Store Encrypted (Secure)
          </button>
          <button
            onClick={retrieveEncryptedData}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
          >
            🔓 Decrypt & Show Data
          </button>
          <button
            onClick={showCurrentUserData}
            className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"
          >
            👤 Show Current User Data
          </button>
        </div>

        {/* Security Management Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={runSecurityAudit}
            className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
          >
            🔍 Run Security Audit
          </button>
          <button
            onClick={migrateExistingData}
            className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
          >
            🔄 Migrate Existing Data
          </button>
          <button
            onClick={forceMigration}
            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            ⚠️ Force Migration (Clears All)
          </button>
        </div>

        {/* Utility Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={clearAllData}
            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
          >
            🗑️ Secure Clear All
          </button>
          <button
            onClick={refreshStorageData}
            className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
          >
            🔄 Refresh View
          </button>
        </div>
      </div>

      {/* Security Audit Results */}
      {auditResults && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="text-xl font-semibold mb-4 text-yellow-800">🔍 Security Audit Results</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Total Items:</strong> {auditResults.totalItems}</p>
              <p><strong>Plain Text Items:</strong> {auditResults.plainTextItems.length}</p>
              <p><strong>Encrypted Items:</strong> {auditResults.encryptedItems.length}</p>
              <p><strong>Sensitive Data Found:</strong> {auditResults.sensitiveData.length}</p>
            </div>
            <div>
              <p><strong>Recommendations:</strong></p>
              <ul className="list-disc list-inside">
                {auditResults.recommendations.map((rec, index) => (
                  <li key={index} className="text-xs">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
          {auditResults.sensitiveData.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
              <p className="font-semibold text-red-800 mb-2">🚨 Sensitive Data Issues:</p>
              {auditResults.sensitiveData.map((item, index) => (
                <div key={index} className="text-xs text-red-700">
                  <strong>{item.key}:</strong> {item.reason}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* localStorage Contents */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">📱 localStorage Contents (Visible to Anyone)</h3>
          <div className="bg-white p-3 rounded border max-h-96 overflow-y-auto">
            {Object.keys(storageData).length === 0 ? (
              <p className="text-gray-500 italic">No data in localStorage</p>
            ) : (
              Object.entries(storageData).map(([key, value]) => (
                <div key={key} className="mb-3 p-2 border-l-4 border-blue-500">
                  <div className="font-semibold text-sm text-blue-600">{key}:</div>
                  <div className="text-sm font-mono bg-gray-100 p-2 rounded mt-1 break-all">
                    {value}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Decrypted Data */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">🔓 Decrypted Data (Only App Can Read)</h3>
          <div className="bg-white p-3 rounded border max-h-96 overflow-y-auto">
            {encryptedData ? (
              <pre className="text-sm font-mono whitespace-pre-wrap">{encryptedData}</pre>
            ) : (
              <p className="text-gray-500 italic">Click "Decrypt & Show Data" to see decrypted content</p>
            )}
          </div>
        </div>
      </div>

      {/* Security Explanation */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">🛡️ Security Explanation</h3>
        <div className="space-y-3 text-blue-700">
          <div className="flex items-start">
            <span className="text-red-500 mr-2">❌</span>
            <div>
              <strong>Plain Text Storage:</strong> Anyone can inspect localStorage and see sensitive data
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-green-500 mr-2">✅</span>
            <div>
              <strong>AES Encrypted Storage:</strong> Data is encrypted with AES-256, unreadable without the key
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">🔒</span>
            <div>
              <strong>HttpOnly Cookies:</strong> Most secure - tokens stored in cookies inaccessible to JavaScript
            </div>
          </div>
          <div className="flex items-start">
            <span className="text-purple-500 mr-2">🔑</span>
            <div>
              <strong>Encryption Key:</strong> Generated from browser fingerprint + secret, unique per session
            </div>
          </div>
        </div>
      </div>

      {/* Browser Console Instructions */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h4 className="font-semibold text-yellow-800 mb-2">🧪 Try This in Browser Console:</h4>
        <div className="text-sm font-mono bg-yellow-100 p-2 rounded space-y-1">
          <div>// Try to access user data directly:</div>
          <div>localStorage.getItem('user') // ❌ Should be null (secure!)</div>
          <div>localStorage.getItem('token') // ❌ Should be null (secure!)</div>
          <div>localStorage.getItem('sec_user_info') // ✅ Encrypted gibberish</div>
          <div>document.cookie // 🔒 HttpOnly cookies won't show</div>
          <div></div>
          <div>// Check all localStorage keys:</div>
          <div>Object.keys(localStorage) // Should only show 'sec_*' items</div>
          <div></div>
          <div>// Try to steal data (this should fail):</div>
          <div>JSON.parse(localStorage.getItem('user')) // ❌ null</div>
        </div>
      </div>
    </div>
  )
}

export default SecurityDemo
