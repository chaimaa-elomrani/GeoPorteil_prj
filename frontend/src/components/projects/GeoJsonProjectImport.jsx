import React, { useState } from 'react'
import { Upload, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { createProjectFromGeoJSON } from '../../services/api'

const GeoJsonProjectImport = ({ onProjectCreated }) => {
  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [geoJsonData, setGeoJsonData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Sample GeoJSON data for quick testing
  const sampleGeoJson = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "name": "School A",
          "type": "education",
          "description": "Primary school"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-7.620037, 33.589886]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "name": "Hospital B",
          "type": "health",
          "description": "Regional Hospital"
        },
        "geometry": {
          "type": "Point",
          "coordinates": [-7.618498, 33.587881]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "name": "Road 1",
          "type": "road",
          "surface": "asphalt"
        },
        "geometry": {
          "type": "LineString",
          "coordinates": [
            [-7.620037, 33.589886],
            [-7.618000, 33.588000],
            [-7.615000, 33.586000]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "name": "Green Park",
          "type": "park",
          "description": "Recreational green space"
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [-7.621000, 33.590000],
              [-7.620000, 33.590000],
              [-7.620000, 33.589000],
              [-7.621000, 33.589000],
              [-7.621000, 33.590000]
            ]
          ]
        }
      }
    ]
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result)
          setGeoJsonData(jsonData)
          setError('')
        } catch (err) {
          setError('Invalid JSON file format')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleUseSampleData = () => {
    setGeoJsonData(sampleGeoJson)
    setProjectName('Sample Infrastructure Project')
    setDescription('A sample project with school, hospital, road, and park features')
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!projectName || !geoJsonData) {
      setError('Project name and GeoJSON data are required')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await createProjectFromGeoJSON({
        name: projectName,
        description: description,
        geoJsonData: geoJsonData
      })

      if (result.success) {
        setSuccess('Project created successfully!')
        setProjectName('')
        setDescription('')
        setGeoJsonData(null)

        if (onProjectCreated) {
          onProjectCreated(result.data)
        }
      } else {
        setError(result.message || 'Failed to create project')
      }
    } catch (err) {
      setError('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Import GeoJSON Project
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <Input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GeoJSON Data *
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".json,.geojson"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="geojson-upload"
                />
                <label
                  htmlFor="geojson-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100"
                >
                  <Upload className="w-4 h-4" />
                  Upload GeoJSON File
                </label>
                <span className="text-gray-500">or</span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseSampleData}
                >
                  Use Sample Data
                </Button>
              </div>

              {geoJsonData && (
                <div className="p-3 bg-gray-50 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Features loaded:</strong> {geoJsonData.features?.length || 0}
                  </p>
                  <div className="text-xs text-gray-500 max-h-32 overflow-y-auto">
                    <pre>{JSON.stringify(geoJsonData, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading || !projectName || !geoJsonData}
              className="flex-1"
            >
              {loading ? 'Creating Project...' : 'Create Project'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default GeoJsonProjectImport
