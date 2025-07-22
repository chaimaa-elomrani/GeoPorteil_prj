"use client"

import { useNavigate } from "react-router-dom"
import { Upload, FileText, Map } from "lucide-react"
import AdminLayout from "./AdminLayout"
import GeoJsonProjectImport from "./GeoJsonProjectImport"

const GeoJsonImport = () => {
  const navigate = useNavigate()

  const handleProjectCreated = (project) => {
    // Navigate to the project detail page or projects list
    navigate(`/projects/${project._id}`)
  }

  return (
    <AdminLayout title="Importer un Projet GeoJSON">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Importer un Projet GeoJSON</h1>
              <p className="text-gray-600 mt-1">
                Créez un nouveau projet en important des données GeoJSON avec des caractéristiques géographiques
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Instructions d'importation
          </h3>
          <div className="space-y-2 text-blue-800">
            <p>• Sélectionnez un fichier GeoJSON valide contenant des données géographiques</p>
            <p>• Le fichier peut contenir des points, lignes, polygones ou collections de géométries</p>
            <p>• Assurez-vous que les propriétés des features contiennent les informations nécessaires</p>
            <p>• Le système créera automatiquement un projet avec toutes les données importées</p>
          </div>
        </div>

        {/* Import Component */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Map className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Télécharger le fichier GeoJSON</h2>
            </div>
            <GeoJsonProjectImport onProjectCreated={handleProjectCreated} />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default GeoJsonImport
