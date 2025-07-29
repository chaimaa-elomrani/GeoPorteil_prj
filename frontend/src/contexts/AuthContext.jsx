"use client"

import React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import secureStorage from "../utils/secureStorage"
import SecurityMigration from "../utils/migrateSecurity"

// User shape for reference (not enforced in JS)
// const user = { id, email, role, username, createdAt };

// AuthContextType shape for reference (not enforced in JS)
// const authContextValue = { user, token, login, logout, isLoading, isAuthenticated };

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication via cookie
    const checkAuth = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/authRoutes/current-user`, {
          credentials: 'include', // Include cookies
        })

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data.user) {
            setUser(data.data.user)

            // 🔒 SECURE: Store encrypted user data
            secureStorage.setUserInfo(data.data.user)

            // Clean up any existing plain text data
            localStorage.removeItem("user")
            localStorage.removeItem("token")
          }
        } else {
          // 🔒 SECURE: Clear all stored data if authentication fails
          secureStorage.clear()
          localStorage.removeItem("user")
          localStorage.removeItem("token")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        // 🔒 SECURE: Clear all data on error
        secureStorage.clear()
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
      setIsLoading(false)
    }

    checkAuth()
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/authRoutes/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include', // Include cookies in request
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Login failed")
    }

    if (data.success && data.data.user) {
      const { user } = data.data
      setUser(user)

      // 🔒 SECURE: Store encrypted user data instead of plain text
      secureStorage.setUserInfo(user)

      // Remove any existing plain text user data
      localStorage.removeItem("user")
      localStorage.removeItem("token")

      // Token is now stored in HttpOnly cookie automatically
      
      // Return the user data for immediate use
      return user
    } else {
      throw new Error(data.message || "Login failed")
    }
  }

  const logout = async () => {
    try {
      // Call logout endpoint to clear HttpOnly cookie
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/authRoutes/logout`, {
        method: "POST",
        credentials: 'include', // Include cookies
      })
    } catch (error) {
      console.error("Logout error:", error)
    }

    // 🔒 SECURE: Complete cleanup of all stored data
    secureStorage.secureLogout()

    // Clear local state
    setUser(null)
    setToken(null)
  }

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user, // Only check user since token is in HttpOnly cookie
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
