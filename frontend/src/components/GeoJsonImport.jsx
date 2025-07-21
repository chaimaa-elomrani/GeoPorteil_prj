"use client"

import { useNavigate } from "react-router-dom"
import GeoJsonProjectImport from "./GeoJsonProjectImport"

const GeoJsonImport = () => {
  const navigate = useNavigate()

  const handleProjectCreated = (project) => {
    // Navigate to the project detail page or projects list
    navigate(`/projects/${project._id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Import GeoJSON Project</h1>
          <p className="text-gray-600">
            Create a new project by importing GeoJSON data with geographic features
          </p>
        </div>

        <GeoJsonProjectImport onProjectCreated={handleProjectCreated} />
      </div>
    </div>
  )
}

export default GeoJsonImport
