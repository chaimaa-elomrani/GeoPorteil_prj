"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { useNavigate } from "react-router-dom"
import { useProjects } from "../hooks/useProjects"
import Toast from "./Toast"

const GeoJsonImport = () => {
  const navigate = useNavigate()
  const { createProject, loading } = useProjects()

  const [files, setFiles] = useState([])
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    status: "active",
  })
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})

  // Handle file drop
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      setToast({
        message: "Seuls les fichiers .geojson sont acceptés",
        type: "error",
      })
      return
    }

    // Process accepted files
    const newFiles = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      featureCount: null,
      boundingBox: null,
      preview: null,
    }))

    // Read and parse GeoJSON files for preview
    newFiles.forEach((fileObj) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const geoJson = JSON.parse(e.target.result)
          fileObj.featureCount = geoJson.features ? geoJson.features.length : 0

          // Calculate bounding box
          if (geoJson.features && geoJson.features.length > 0) {
            const coords = []
            geoJson.features.forEach((feature) => {
              if (feature.geometry && feature.geometry.coordinates) {
                const flatCoords = flattenCoordinates(feature.geometry.coordinates)
                coords.push(...flatCoords)
              }
            })

            if (coords.length > 0) {
              const lngs = coords.filter((_, i) => i % 2 === 0)
              const lats = coords.filter((_, i) => i % 2 === 1)
              fileObj.boundingBox = {
                minLng: Math.min(...lngs),
                maxLng: Math.max(...lngs),
                minLat: Math.min(...lats),
                maxLat: Math.max(...lats),
              }
            }
          }

          setFiles((prev) => [...prev])
        } catch (error) {
          console.error("Error parsing GeoJSON:", error)
          fileObj.featureCount = "Erreur"
        }
      }
      reader.readAsText(fileObj.file)
    })

    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  // Flatten coordinates for bounding box calculation
  const flattenCoordinates = (coords) => {
    const result = []
    const flatten = (arr) => {
      if (typeof arr[0] === "number") {
        result.push(arr[0], arr[1])
      } else {
        arr.forEach(flatten)
      }
    }
    flatten(coords)
    return result
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/geo+json": [".geojson"],
      "application/json": [".geojson"],
    },
    multiple: true,
  })

  // Remove file from list
  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProjectData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!projectData.name.trim()) {
      newErrors.name = "Le nom du projet est requis"
    }

    if (files.length === 0) {
      newErrors.files = "Au moins un fichier GeoJSON est requis"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await createProject({
        ...projectData,
        files: files.map((f) => f.file),
      })

      setToast({
        message: "Projet importé avec succès",
        type: "success",
      })

      // Redirect after short delay
      setTimeout(() => {
        navigate("/projects")
      }, 1500)
    } catch (error) {
      setToast({
        message: error.message,
        type: "error",
      })
    }
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Format bounding box
  const formatBoundingBox = (bbox) => {
    if (!bbox) return "N/A"
    return `${bbox.minLng.toFixed(4)}, ${bbox.minLat.toFixed(4)} - ${bbox.maxLng.toFixed(4)}, ${bbox.maxLat.toFixed(4)}`
  }

  const isSubmitDisabled = loading || files.length === 0 || !projectData.name.trim()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Import GeoJSON</h1>
            <button
              onClick={() => navigate("/projects")}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <span>← Retour aux projets</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Sélectionner les fichiers GeoJSON</h2>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-lg text-gray-600">
                  {isDragActive ? "Déposez les fichiers ici..." : "Glissez-déposez vos fichiers GeoJSON ici"}
                </p>
                <p className="text-sm text-gray-500">ou cliquez pour sélectionner des fichiers (.geojson)</p>
              </div>
            </div>

            {errors.files && <p className="mt-2 text-sm text-red-600">{errors.files}</p>}
          </div>

          {/* File Preview Table */}
          {files.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Aperçu des fichiers</h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom du fichier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Taille
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entités
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Emprise
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {files.map((fileObj) => (
                      <tr key={fileObj.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {fileObj.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatFileSize(fileObj.size)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {fileObj.featureCount !== null ? fileObj.featureCount : "Chargement..."}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatBoundingBox(fileObj.boundingBox)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            type="button"
                            onClick={() => removeFile(fileObj.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Project Metadata Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Informations du projet</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={projectData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Entrez le nom du projet"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              {/* Project Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  id="status"
                  name="status"
                  value={projectData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Actif</option>
                  <option value="draft">Brouillon</option>
                  <option value="closed">Fermé</option>
                </select>
              </div>

              {/* Project Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={projectData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description du projet..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                isSubmitDisabled
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Import en cours...</span>
                </div>
              ) : (
                "Importer le projet"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Toast notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

export default GeoJsonImport
