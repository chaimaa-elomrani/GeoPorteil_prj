"use client"

import { useState } from "react"

export default function RejectionModal({ request, onReject, onCancel, loading }) {
  const [reason, setReason] = useState("")
  const [selectedReason, setSelectedReason] = useState("")
  const [errors, setErrors] = useState({})

  const predefinedReasons = [
    "Informations incomplètes",
    "Email non valide",
    "Demande en double",
    "Ne répond pas aux critères d'éligibilité",
    "Domaine d'email non autorisé",
    "Autre (préciser ci-dessous)",
  ]

  const handleReasonSelect = (selectedReason) => {
    setSelectedReason(selectedReason)
    if (selectedReason !== "Autre (préciser ci-dessous)") {
      setReason(selectedReason)
    } else {
      setReason("")
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!reason.trim()) {
      newErrors.reason = "La raison du rejet est requise"
    } else if (reason.trim().length < 10) {
      newErrors.reason = "Veuillez fournir une raison plus détaillée (minimum 10 caractères)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onReject(request._id, reason.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Rejeter la demande</h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Rejeter la demande de <span className="font-medium">{request.email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* User Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Informations de la demande</h4>
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">Email:</span> {request.email}
              </p>
              <p>
                <span className="font-medium">Date de demande:</span>{" "}
                {new Date(request.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>

          {/* Predefined Reasons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Raison du rejet *</label>
            <div className="space-y-2">
              {predefinedReasons.map((predefinedReason) => (
                <label key={predefinedReason} className="flex items-center">
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={predefinedReason}
                    checked={selectedReason === predefinedReason}
                    onChange={(e) => handleReasonSelect(e.target.value)}
                    className="mr-3 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">{predefinedReason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedReason === "Autre (préciser ci-dessous)"
                ? "Précisez la raison *"
                : "Détails supplémentaires (optionnel)"}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors ${
                errors.reason ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={
                selectedReason === "Autre (préciser ci-dessous)"
                  ? "Expliquez la raison du rejet..."
                  : "Ajoutez des détails supplémentaires si nécessaire..."
              }
            />
            {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
          </div>

      
        

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Rejet...</span>
                </div>
              ) : (
                "Rejeter et envoyer l'email"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
