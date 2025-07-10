"use client"

import React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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
    // Check for existing auth on mount
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/authRoutes/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Login failed")
    }

    if (data.success && data.data.token) {
      const { token, user } = data.data
      setToken(token)
      setUser(user)
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
    } else {
      throw new Error(data.message || "Login failed")
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  const value = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
