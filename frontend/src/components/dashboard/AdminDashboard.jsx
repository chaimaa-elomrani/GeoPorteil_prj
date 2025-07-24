"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import Sidebar from "../layout/Sidebar"
import Header from "../layout/Header"
import DashboardOverview from "./DashboardOverview"
import UserManagement from "../users/UserManagement"
import SignupRequests from "../users/SignupRequests"
import { apiService } from "../../services/api"

export default function AdminDashboard() {
  const location = useLocation()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState({
    name: "Admin User",
    role: "Administrateur",
    avatar: "AU",
  })

  // Determine active tab based on current URL
  const getActiveTab = () => {
    const path = location.pathname
    if (path.includes('/admin/users')) return 'users'
    if (path.includes('/admin/signup-requests')) return 'requests'
    if (path.includes('/projects')) return 'projects'
    if (path.includes('/security-demo')) return 'security'
    return 'dashboard'
  }

  const activeTab = getActiveTab()

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiService.getDashboardStats()
      if (response.success) {
        setStats(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch stats")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      setError(error.message)

      // Use mock data as fallback
      setStats({
        stats: {
          total_users: 150,
          pending_requests: 8,
          approved_requests: 142,
          rejected_requests: 6,
          total_requests: 156,
        },
        recent_requests: [],
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview stats={stats} loading={loading} />
      case "users":
        return <UserManagement onStatsUpdate={fetchDashboardStats} />
      case "requests":
        return <SignupRequests onStatsUpdate={fetchDashboardStats} />
      case "projects":
        return (
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Projets</h2>
            <p className="text-gray-600">Section des projets en cours de développement...</p>
          </div>
        )
      case "security":
        return (
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sécurité</h2>
            <p className="text-gray-600">
              Fonctionnalités de sécurité disponibles dans la{" "}
              <a href="/security-demo" className="text-blue-600 hover:underline">
                page de démonstration sécurité
              </a>
            </p>
          </div>
        )
      default:
        return <DashboardOverview stats={stats} loading={loading} />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} user={user} onRefresh={fetchDashboardStats} />
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">⚠️ {error}</p>
              <button onClick={fetchDashboardStats} className="mt-2 text-red-600 hover:text-red-800 underline">
                Retry
              </button>
            </div>
          )}
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
