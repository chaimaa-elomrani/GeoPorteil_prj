"use client"

import { useState, useEffect } from "react"
import api from "../utils/api"

// Mock data for testing without backend - Morocco examples
const mockProjects = [
  {
    _id: "1",
    name: "Développement Urbain Casablanca",
    description: "Cartographie des zones de développement urbain du Grand Casablanca",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
    geoJsonUrl: "/mock-data/casablanca-urban.geojson",
  },
  {
    _id: "2",
    name: "Zones Agricoles Souss-Massa",
    description: "Cartographie des zones agricoles et d'irrigation dans la région Souss-Massa",
    status: "active",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-18T09:15:00Z",
    geoJsonUrl: "/mock-data/souss-agriculture.geojson",
  },
  {
    _id: "3",
    name: "Patrimoine Historique Fès",
    description: "Inventaire géospatial du patrimoine historique de la médina de Fès",
    status: "draft",
    createdAt: "2023-12-05T14:20:00Z",
    updatedAt: "2024-01-05T11:45:00Z",
    geoJsonUrl: "/mock-data/fes-heritage.geojson",
  },
  {
    _id: "4",
    name: "Infrastructure Portuaire Tanger",
    description: "Cartographie des infrastructures portuaires et logistiques de Tanger Med",
    status: "active",
    createdAt: "2024-01-08T09:00:00Z",
    updatedAt: "2024-01-22T14:20:00Z",
    geoJsonUrl: "/mock-data/tanger-port.geojson",
  },
  {
    _id: "5",
    name: "Zones Touristiques Marrakech",
    description: "Développement touristique et hôtelier dans la région de Marrakech",
    status: "closed",
    createdAt: "2023-11-15T16:30:00Z",
    updatedAt: "2023-12-20T10:15:00Z",
    geoJsonUrl: "/mock-data/marrakech-tourism.geojson",
  },
  {
    _id: "6",
    name: "Énergies Renouvelables Ouarzazate",
    description: "Complexe solaire Noor Ouarzazate et zones d'énergie renouvelable",
    status: "active",
    createdAt: "2024-01-12T11:45:00Z",
    updatedAt: "2024-01-25T08:30:00Z",
    geoJsonUrl: "/mock-data/ouarzazate-solar.geojson",
  },
]

// Mock GeoJSON data with Morocco locations
const mockGeoJsonData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        name: "Mosquée Hassan II",
        status: "active",
        type: "monument",
        description: "Grande mosquée de Casablanca",
        city: "Casablanca",
      },
      geometry: {
        type: "Point",
        coordinates: [-7.6327, 33.6084],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Tour Hassan",
        status: "active",
        type: "monument",
        description: "Monument historique de Rabat",
        city: "Rabat",
      },
      geometry: {
        type: "Point",
        coordinates: [-6.8267, 34.0242],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Place Jemaa el-Fna",
        status: "active",
        type: "cultural",
        description: "Place principale de Marrakech",
        city: "Marrakech",
      },
      geometry: {
        type: "Point",
        coordinates: [-7.9898, 31.6258],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Zone Industrielle Casablanca",
        status: "active",
        type: "industrial",
        area: 25000,
        employees: 15000,
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-7.65, 33.55],
            [-7.6, 33.55],
            [-7.6, 33.6],
            [-7.65, 33.6],
            [-7.65, 33.55],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Zone Agricole Souss",
        status: "active",
        type: "agricultural",
        area: 50000,
        crop_type: "Agrumes",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-9.6, 30.4],
            [-9.5, 30.4],
            [-9.5, 30.5],
            [-9.6, 30.5],
            [-9.6, 30.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Zone Résidentielle Rabat",
        status: "active",
        type: "residential",
        population: 25000,
        district: "Agdal",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.85, 33.99],
            [-6.83, 33.99],
            [-6.83, 34.01],
            [-6.85, 34.01],
            [-6.85, 33.99],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Autoroute Casablanca-Rabat",
        status: "active",
        type: "infrastructure",
        length: 91,
        highway: "A1",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [-7.5898, 33.5731], // Casablanca
          [-7.2, 33.7],
          [-6.9, 33.85],
          [-6.8498, 34.0209], // Rabat
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        name: "Complexe Solaire Noor",
        status: "active",
        type: "energy",
        capacity: "580 MW",
        technology: "Solaire concentré",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [-6.95, 30.85],
            [-6.85, 30.85],
            [-6.85, 30.95],
            [-6.95, 30.95],
            [-6.95, 30.85],
          ],
        ],
      },
    },
  ],
}

export const useProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check if we should use mock data (no backend available)
  const useMockData = !localStorage.getItem("token") || process.env.NODE_ENV === "development"

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      if (useMockData) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setProjects(mockProjects)
        return
      }

      const response = await api.get("/projects")
      setProjects(response.data)
    } catch (err) {
      console.warn("Backend not available, using mock data")
      setProjects(mockProjects)
      setError(null) // Don't show error when falling back to mock data
    } finally {
      setLoading(false)
    }
  }

  // Create new project
  const createProject = async (projectData) => {
    try {
      setLoading(true)
      setError(null)

      if (useMockData) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Create mock project
        const newProject = {
          _id: Date.now().toString(),
          name: projectData.name,
          description: projectData.description || "",
          status: projectData.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          geoJsonUrl: "/mock-data/new-project.geojson",
        }

        setProjects((prev) => [...prev, newProject])
        return newProject
      }

      const formData = new FormData()
      formData.append("name", projectData.name)
      formData.append("description", projectData.description || "")
      formData.append("status", projectData.status)

      // Append files
      projectData.files.forEach((file) => {
        formData.append("files", file)
      })

      const response = await api.post("/projects", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Refresh projects list
      await fetchProjects()
      return response.data
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to create project"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Fetch GeoJSON data for a project
  const fetchProjectGeoJSON = async (geoJsonUrl) => {
    try {
      if (useMockData) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500))
        return mockGeoJsonData
      }

      const response = await api.get(geoJsonUrl)
      return response.data
    } catch (err) {
      console.warn("Using mock GeoJSON data")
      return mockGeoJsonData
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    fetchProjectGeoJSON,
  }
}
