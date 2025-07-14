"use client"

import React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import secureStorage from "../utils/secureStorage"

// Create context
const SecureAuthContext = createContext()

// Custom hook to use auth context
export const useSecureAuth = () => {
  const context = useContext(SecureAuthContext)
  if (context === undefined) {
    throw new Error("useSecureAuth must be used within a SecureAuthProvider")
  }
  return context
}

export const SecureAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing authentication
    const checkAuth = async () => {
      try {
        // Option 1: Try HttpOnly cookie authentication (most secure)
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/authRoutes/current-user`, {
          credentials: 'include', // Include HttpOnly cookies
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data.user) {
            setUser(data.data.user)
            // Store minimal encrypted info for UI purposes
            secureStorage.setUserInfo(data.data.user)
            return
          }
        }

        // Option 2: Fallback to encrypted localStorage token (if HttpOnly cookies fail)
        const token = secureStorage.getToken()
        if (token) {
          const tokenResponse = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/authRoutes/verify-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          })
          
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json()
            if (tokenData.success && tokenData.data.user) {
              setUser(tokenData.data.user)
              secureStorage.setUserInfo(tokenData.data.user)
              return
            }
          }
        }

        // No valid authentication found
        secureStorage.clear()
        
      } catch (error) {
        console.error("Auth check error:", error)
        secureStorage.clear()
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/authRoutes/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include', // Include cookies for HttpOnly approach
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Login failed")
    }

    if (data.success && data.data.user) {
      const { user, token } = data.data
      setUser(user)
      
      // Store encrypted minimal user info
      secureStorage.setUserInfo(user)
      
      // If token is provided (fallback mode), store it encrypted
      if (token) {
        secureStorage.setToken(token)
      }
      
      console.log("🔒 Login successful with secure storage")
    } else {
      throw new Error(data.message || "Login failed")
    }
  }

  const logout = async () => {
    try {
      // Call logout endpoint to clear HttpOnly cookie
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/authRoutes/logout`, {
        method: "POST",
        credentials: 'include',
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
    
    // Secure logout - clear all local data
    secureStorage.secureLogout()
    setUser(null)
    
    console.log("🔒 Secure logout completed")
  }

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
    // Utility functions
    getUserInitials: () => {
      const userInfo = secureStorage.getUserInfo()
      return userInfo?.initials || 'U'
    },
    getUserRole: () => user?.role || 'guest'
  }

  return <SecureAuthContext.Provider value={value}>{children}</SecureAuthContext.Provider>
}

export default SecureAuthProvider
