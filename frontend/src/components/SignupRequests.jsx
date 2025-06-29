"use client"

import { useState, useEffect } from "react"
import { apiService } from "../services/api"

export default function SignupRequests({ onStatsUpdate }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedStatus, setSelectedStatus] = useState("pending")
  const [actionLoading, setActionLoading] = useState({})

  useEffect(() => {
    fetchRequests()
  }, [currentPage, selectedStatus])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        status: selectedStatus,
      }

      const response = await apiService.getAllSignupRequests(params)

      if (response.success) {
        setRequests(response.data.requests)
        setTotalPages(response.data.pagination.total_pages)
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [requestId]: "approving" }))

      const response = await apiService.approveSignupRequest(requestId)

      if (response.success) {
        await fetchRequests()
        onStatsUpdate?.()
      } else {
        alert(response.message || "Erreur lors de l'approbation")
      }
    } catch (error) {
      console.error("Error approving request:", error)
      alert("Erreur lors de l'approbation")
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: null }))
    }
  }

  const handleReject = async (requestId) => {
    try {
      setActionLoading((prev) => ({ ...prev, [requestId]: "rejecting" }))

      const response = await apiService.rejectSignupRequest(requestId)

      if (response.success) {
        await fetchRequests()
        onStatsUpdate?.()
      } else {
        alert(response.message || "Erreur lors du rejet")
      }
    } catch (error) {
      console.error("Error rejecting request:", error)
      alert("Erreur lors du rejet")
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: null }))
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "En attente" },
      approved: { class: "bg-green-100 text-green-800 border-green-200", label: "Approuvé" },
      rejected: { class: "bg-red-100 text-red-800 border-red-200", label: "Rejeté" },
    }
    return badges[status] || badges.pending
  }

  if (loading && requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Demandes d'inscription</h2>
            <p className="text-gray-600 mt-1">Gérez les demandes d'accès à votre plateforme</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="pending">En attente</option>
            <option value="approved">Approuvées</option>
            <option value="rejected">Rejetées</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de demande
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => {
                const statusBadge = getStatusBadge(request.status)
                const isLoading = actionLoading[request._id]

                return (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white text-sm font-medium">
                            {request.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{request.email}</div>
                          <div className="text-xs text-gray-500">ID: {request._id.slice(-8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${statusBadge.class}`}
                      >
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.status === "pending" && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApprove(request._id)}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                          >
                            {isLoading === "approving" ? "Approbation..." : "Approuver"}
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
                          >
                            {isLoading === "rejecting" ? "Rejet..." : "Rejeter"}
                          </button>
                        </div>
                      )}
                      {request.status !== "pending" && (
                        <span className="text-gray-400 text-sm">
                          {request.status === "approved" ? "Approuvé" : "Rejeté"} le{" "}
                          {new Date(request.approvedAt || request.rejectedAt).toLocaleDateString("fr-FR")}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {requests.length === 0 && !loading && (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg">Aucune demande trouvée</p>
              <p className="text-gray-400 text-sm">
                Aucune demande{" "}
                {selectedStatus === "pending" ? "en attente" : selectedStatus === "approved" ? "approuvée" : "rejetée"}{" "}
                pour le moment
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
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
      </div>
    </div>
  )
}
