"use client"

import { useState } from "react"

export default function UserTable({
  users,
  loading,
  onEdit,
  onDelete,
  onApprove,
  onSuspend,
  onUnsuspend,
  onBlock,
  onUnblock,
  actionLoading,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(null)

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800 border-purple-200",
      "Directeur technique": "bg-blue-100 text-blue-800 border-blue-200",
      "Directeur generale": "bg-red-100 text-red-800 border-red-200",
      "Directeur administratif": "bg-green-100 text-green-800 border-green-200",
      Technicien: "bg-yellow-100 text-yellow-800 border-yellow-200",
      "chef de projet": "bg-indigo-100 text-indigo-800 border-indigo-200",
      client: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return colors[role] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"
  }

  const toggleDropdown = (userId) => {
    setDropdownOpen(dropdownOpen === userId ? null : userId)
  }

  const closeDropdown = () => {
    setDropdownOpen(null)
  }

  if (loading && users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date d'inscription
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-medium">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.name || (user.name) ? `${user.name}`: "Non renseigné"}</div>
                    </div>
                  </div>
                </td>


                {/* Phone Number Column */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.phone || "Non renseigné"}</div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(user.status)}`}
                  >
                    {user.status === "suspended"
                      ? "Suspendu"
                      : user.status === "blocked" || user.isBlocked
                        ? "Bloqué"
                        : user.isActive !== false
                          ? "Actif"
                          : "Inactif"}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    {/* Suspend/Unsuspend Toggle */}
                    {user.status === "suspended" ? (
                      <button
                        onClick={() => onUnsuspend?.(user._id)}
                        disabled={actionLoading[`unsuspend_${user._id}`]}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        {actionLoading[`unsuspend_${user._id}`] ? "Traitement..." : "Réactiver"}
                      </button>
                    ) : (
                      <button
                        onClick={() => onSuspend?.(user._id)}
                        disabled={actionLoading[`suspend_${user._id}`]}
                        className="text-orange-600 hover:text-orange-800 font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        {actionLoading[`suspend_${user._id}`] ? "Traitement..." : "Suspendre"}
                      </button>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => toggleDropdown(user._id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {dropdownOpen === user._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={closeDropdown}></div>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onEdit(user)
                                  closeDropdown()
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Mettre à jour
                                </div>
                              </button>
                              <button
                                onClick={() => {
                                  onDelete(user._id)
                                  closeDropdown()
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <div className="flex items-center">
                                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Supprimer
                                </div>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
            <p className="text-gray-400 text-sm">Essayez de modifier vos critères de recherche</p>
          </div>
        )}
      </div>
    </div>
  )
}
