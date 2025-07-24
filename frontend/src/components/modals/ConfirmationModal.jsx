import React from 'react'
import { X, AlertTriangle, Archive, Trash2, RefreshCw } from 'lucide-react'

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  action, 
  projectName, 
  projectNumber,
  loading = false 
}) => {
  if (!isOpen) return null

  const getActionConfig = () => {
    switch (action) {
      case 'archive':
        return {
          title: 'Archiver le projet',
          icon: <Archive className="h-8 w-8 text-orange-500" />,
          description: `Vous êtes sur le point d'archiver le projet "${projectName}" (#${projectNumber}).`,
          consequences: [
            'Le projet sera déplacé vers la section des projets archivés',
            'Il ne sera plus visible dans la liste principale des projets actifs',
            'Toutes les données du projet seront conservées',
            'Vous pourrez réactiver le projet à tout moment',
            'Les membres de l\'équipe ne pourront plus modifier le projet'
          ],
          confirmText: 'Oui, archiver le projet',
          cancelText: 'Annuler',
          confirmClass: 'bg-orange-500 hover:bg-orange-600 text-white',
          loadingText: 'Archivage en cours...'
        }
      
      case 'reactivate':
        return {
          title: 'Réactiver le projet',
          icon: <RefreshCw className="h-8 w-8 text-green-500" />,
          description: `Vous êtes sur le point de réactiver le projet "${projectName}" (#${projectNumber}).`,
          consequences: [
            'Le projet sera restauré dans la liste des projets actifs',
            'Il redeviendra visible et accessible à tous les utilisateurs',
            'Les membres de l\'équipe pourront à nouveau modifier le projet',
            'Toutes les données et l\'historique seront préservés',
            'Le projet reprendra son statut normal de fonctionnement'
          ],
          confirmText: 'Oui, réactiver le projet',
          cancelText: 'Annuler',
          confirmClass: 'bg-green-500 hover:bg-green-600 text-white',
          loadingText: 'Réactivation en cours...'
        }
      
      case 'delete':
        return {
          title: 'Supprimer définitivement le projet',
          icon: <Trash2 className="h-8 w-8 text-red-500" />,
          description: `Vous êtes sur le point de supprimer définitivement le projet "${projectName}" (#${projectNumber}).`,
          consequences: [
            '⚠️ Cette action est IRRÉVERSIBLE',
            'Toutes les données du projet seront définitivement perdues',
            'Les données GeoJSON et les statistiques seront supprimées',
            'L\'historique et les métadonnées seront effacés',
            'Les membres de l\'équipe perdront l\'accès au projet',
            'Aucune récupération ne sera possible après confirmation'
          ],
          confirmText: 'Oui, supprimer définitivement',
          cancelText: 'Annuler',
          confirmClass: 'bg-red-500 hover:bg-red-600 text-white',
          loadingText: 'Suppression en cours...'
        }
      
      default:
        return {
          title: 'Confirmer l\'action',
          icon: <AlertTriangle className="h-8 w-8 text-yellow-500" />,
          description: 'Êtes-vous sûr de vouloir effectuer cette action ?',
          consequences: [],
          confirmText: 'Confirmer',
          cancelText: 'Annuler',
          confirmClass: 'bg-blue-500 hover:bg-blue-600 text-white',
          loadingText: 'En cours...'
        }
    }
  }

  const config = getActionConfig()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {config.icon}
            <h2 className="text-xl font-semibold text-gray-900">
              {config.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <p className="text-gray-700 mb-4">
            {config.description}
          </p>

          {/* Consequences */}
          {config.consequences.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Conséquences de cette action :
              </h3>
              <ul className="space-y-2">
                {config.consequences.map((consequence, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-gray-400 mt-1">•</span>
                    <span className={`text-sm ${
                      consequence.includes('⚠️') || consequence.includes('IRRÉVERSIBLE') 
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-600'
                    }`}>
                      {consequence}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warning for delete action */}
          {action === 'delete' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-800 font-medium text-sm">
                  Attention : Cette action ne peut pas être annulée !
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {config.cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${config.confirmClass}`}
          >
            {loading ? config.loadingText : config.confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
