"use client"

import { useState, useEffect } from "react"

import { apiService } from "../services/api"

import UserTable from "./UserTable"

import UserForm from "./UserForm"

export default function UserManagement({ onStatsUpdate }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRole, setSelectedRole] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [actionLoading, setActionLoading] = useState({})

  const handleSuspendUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir suspendre cet utilisateur ?")) {
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [`suspend_${userId}`]: true }))
      console.log("🔄 Suspending user:", userId)
      const response = await apiService.suspendUser(userId, "Suspendu par l'administrateur")
      console.log("✅ User suspended successfully:", response)
      await fetchUsers()
      onStatsUpdate?.()
      alert("Utilisateur suspendu avec succès")
    } catch (error) {
      console.error("❌ Error suspending user:", error)
      alert("Erreur lors de la suspension: " + error.message)
    } finally {
      setActionLoading((prev) => ({ ...prev, [`suspend_${userId}`]: false }))
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, selectedRole])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log("🔄 Fetching users with params:", { currentPage, selectedRole, searchTerm })

      const params = {
        page: currentPage,
        limit: 10,
        ...(selectedRole && { role: selectedRole }),
        ...(searchTerm && { search: searchTerm }),
      }

      const response = await apiService.getAllUsers(params)
      console.log("📊 Users API response:", response)

      if (response.success) {
        setUsers(response.data.users || [])
        setTotalPages(response.data.pagination?.total_pages || 1)
        console.log("✅ Users loaded successfully:", response.data.users?.length || 0, "users")
      } else {
        console.error("❌ API returned error:", response.message)
        setUsers([])
        setTotalPages(1)
      }
    } catch (error) {
      console.error("❌ Error fetching users:", error)
      setUsers([])
      setTotalPages(1)
      alert("Erreur lors du chargement des utilisateurs: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchUsers()
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setShowForm(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleFormSubmit = async (userData) => {
    try {
      setActionLoading((prev) => ({ ...prev, form: true }))
      if (editingUser) {
        await apiService.updateUser(editingUser._id, userData)
      } else {
        await apiService.createUser(userData)
      }
      setShowForm(false)
      setEditingUser(null)
      await fetchUsers()
      onStatsUpdate?.()
    } catch (error) {
      alert(error.message)
    } finally {
      setActionLoading((prev) => ({ ...prev, form: false }))
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }))
      await apiService.deleteUser(userId)
      await fetchUsers()
      onStatsUpdate?.()
    } catch (error) {
      alert(error.message)
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const handleApproveUser = async (userId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [userId]: true }))
      // Add your approve user API call here
      // await apiService.approveUser(userId)
      console.log("Approving user:", userId)
      await fetchUsers()
      onStatsUpdate?.()
    } catch (error) {
      alert(error.message)
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }))
    }
  }

  const handleBlockUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir bloquer cet utilisateur ?")) {
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [`block_${userId}`]: true }))
      console.log("🔄 Blocking user:", userId)
      const response = await apiService.blockUser(userId, "Bloqué par l'administrateur")
      console.log("✅ User blocked successfully:", response)
      await fetchUsers()
      onStatsUpdate?.()
      alert("Utilisateur bloqué avec succès")
    } catch (error) {
      console.error("❌ Error blocking user:", error)
      alert("Erreur lors du blocage: " + error.message)
    } finally {
      setActionLoading((prev) => ({ ...prev, [`block_${userId}`]: false }))
    }
  }

  const handleUnsuspendUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir réactiver cet utilisateur ?")) {
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [`unsuspend_${userId}`]: true }))
      console.log("🔄 Unsuspending user:", userId)
      const response = await apiService.unsuspendUser(userId)
      console.log("✅ User unsuspended successfully:", response)
      await fetchUsers()
      onStatsUpdate?.()
      alert("Utilisateur réactivé avec succès")
    } catch (error) {
      console.error("❌ Error unsuspending user:", error)
      alert("Erreur lors de la réactivation: " + error.message)
    } finally {
      setActionLoading((prev) => ({ ...prev, [`unsuspend_${userId}`]: false }))
    }
  }

  const handleUnblockUser = async (userId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir débloquer cet utilisateur ?")) {
      return
    }

    try {
      setActionLoading((prev) => ({ ...prev, [`unblock_${userId}`]: true }))
      console.log("🔄 Unblocking user:", userId)
      const response = await apiService.unblockUser(userId)
      console.log("✅ User unblocked successfully:", response)
      await fetchUsers()
      onStatsUpdate?.()
      alert("Utilisateur débloqué avec succès")
    } catch (error) {
      console.error("❌ Error unblocking user:", error)
      alert("Erreur lors du déblocage: " + error.message)
    } finally {
      setActionLoading((prev) => ({ ...prev, [`unblock_${userId}`]: false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h2>
            <p className="text-gray-600 mt-1">Gérez tous les utilisateurs de votre plateforme</p>
          </div>

          <button
            onClick={handleAddUser}
            className="bg-[#354939] hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Ajouter un utilisateur</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tous les rôles</option>
            <option value="admin">Administrateur</option>
            <option value="Directeur technique">Directeur technique</option>
            <option value="Directeur generale">Directeur général</option>
            <option value="Directeur administratif">Directeur administratif</option>
            <option value="Technicien">Technicien</option>
            <option value="chef de projet">Chef de projet</option>
          </select>

          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Rechercher
          </button>
        </div>
      </div>

      {/* Users Table */}
      <UserTable
        users={users}
        loading={loading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onApprove={handleApproveUser}
        onSuspend={handleSuspendUser}
        onUnsuspend={handleUnsuspendUser}
        onBlock={handleBlockUser}
        onUnblock={handleUnblockUser}
        actionLoading={actionLoading}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> sur{" "}
              <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingUser(null)
          }}
          loading={actionLoading.form}
        />
      )}
    </div>
  )
}
