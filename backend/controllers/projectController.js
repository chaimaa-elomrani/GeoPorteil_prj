const Project = require("../models/Project")

// Get all projects
const getAllProjects = async (req, res) => {
  try {
    console.log("🔍 Fetching all projects...")

    const { page = 1, limit = 50, status, region, search, archived } = req.query

    // Build query
    const query = {}

    // Handle archived filter
    if (archived !== undefined) {
      query.archived = archived === 'true'
    }

    if (status && status !== "all") {
      query.projectStatus = status
    }

    if (region && region !== "all") {
      query.region = region
    }

    if (search) {
      query.$or = [
        { projectNumber: { $regex: search, $options: "i" } },
        { "maitreOuvrage.name": { $regex: search, $options: "i" } },
        { region: { $regex: search, $options: "i" } },
        { prefecture: { $regex: search, $options: "i" } },
      ]
    }

    console.log("🔍 Query filters:", query)

    const projects = await Project.find(query)
      .populate("maitreOuvrage", "name email phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const total = await Project.countDocuments(query)

    console.log(`✅ Found ${projects.length} projects (${total} total)`)

    res.json({
      success: true,
      data: projects,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("❌ Error fetching projects:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des projets",
      error: error.message,
    })
  }
}

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params
    console.log("🔍 Fetching project by ID:", id)

    const project = await Project.findById(id).populate("maitreOuvrage", "name email phone").exec()

    if (!project) {
      console.log("❌ Project not found:", id)
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      })
    }

    console.log("✅ Project found:", project.projectNumber)

    res.json({
      success: true,
      data: project,
    })
  } catch (error) {
    console.error("❌ Error fetching project:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du projet",
      error: error.message,
    })
  }
}

// Create new project
const createProject = async (req, res) => {
  try {
    console.log("➕ Creating new project:", req.body)

    const projectData = req.body

    // Handle both old and new project structures
    const projectNumber = projectData.projectInfo?.projectNumber || projectData.projectNumber

    console.log("🔍 Project number to check:", projectNumber)
    console.log("🔍 Project data structure:", {
      hasProjectInfo: !!projectData.projectInfo,
      projectInfoNumber: projectData.projectInfo?.projectNumber,
      directProjectNumber: projectData.projectNumber
    })

    // Validate required fields
    if (!projectNumber) {
      return res.status(400).json({
        success: false,
        message: "Le numéro de projet est requis",
      })
    }

    // Check if project number already exists (check both old and new structure)
    const existingProject = await Project.findOne({
      $or: [
        { "projectInfo.projectNumber": projectNumber },
        { projectNumber: projectNumber }
      ]
    })

    console.log("🔍 Existing project found:", existingProject ? existingProject.projectInfo?.projectNumber || existingProject.projectNumber : "None")

    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: `Un projet avec ce numéro existe déjà: ${existingProject.projectInfo?.projectNumber || existingProject.projectNumber}`,
      })
    }

    console.log("🔧 Creating project with data:", JSON.stringify(projectData, null, 2))

    try {
      const project = new Project(projectData)
      console.log("💾 Saving project to database...")
      await project.save()

      console.log("✅ Project created successfully:", project._id)

      res.status(201).json({
        success: true,
        data: project,
        message: "Projet créé avec succès",
      })
    } catch (saveError) {
      console.error("❌ Error saving project:", saveError)
      console.error("❌ Error details:", saveError.message)
      console.error("❌ Error stack:", saveError.stack)

      // Handle validation errors
      if (saveError.name === 'ValidationError') {
        const validationErrors = Object.values(saveError.errors).map(err => err.message)
        return res.status(400).json({
          success: false,
          message: "Erreur de validation: " + validationErrors.join(', '),
          errors: validationErrors
        })
      }

      // Handle MongoDB duplicate key errors
      if (saveError.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Un projet avec ce numéro existe déjà",
        })
      }

      // Handle custom errors from pre-save middleware
      if (saveError.message.includes('GeoJSON feature') || saveError.message.includes('Statistics')) {
        return res.status(400).json({
          success: false,
          message: saveError.message,
        })
      }

      throw saveError // Re-throw to be caught by outer catch
    }

  } catch (error) {
    console.error("❌ Outer error creating project:", error)

    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du projet",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params
    console.log("✏️ Updating project:", id, req.body)

    const project = await Project.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).populate(
      "maitreOuvrage",
      "name email phone",
    )

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      })
    }

    console.log("✅ Project updated:", project.projectNumber)

    res.json({
      success: true,
      data: project,
      message: "Projet mis à jour avec succès",
    })
  } catch (error) {
    console.error("❌ Error updating project:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du projet",
      error: error.message,
    })
  }
}

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params
    console.log("🗑️ Deleting project:", id)

    const project = await Project.findByIdAndDelete(id)

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Projet non trouvé",
      })
    }

    console.log("✅ Project deleted:", project.projectNumber)

    res.json({
      success: true,
      message: "Projet supprimé avec succès",
    })
  } catch (error) {
    console.error("❌ Error deleting project:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du projet",
      error: error.message,
    })
  }
}

// Get project statistics
const getProjectStats = async (req, res) => {
  try {
    console.log("📊 Calculating project statistics...")

    const stats = await Project.aggregate([
      {
        $group: {
          _id: "$projectStatus",
          count: { $sum: 1 },
        },
      },
    ])

    const total = await Project.countDocuments()

    const formattedStats = {
      total,
      enCours: stats.find((s) => s._id === "En cours")?.count || 0,
      livre: stats.find((s) => s._id === "livré")?.count || 0,
      suspendu: stats.find((s) => s._id === "Suspendu")?.count || 0,
      termine: stats.find((s) => s._id === "Terminé")?.count || 0,
    }

    console.log("✅ Project statistics calculated:", formattedStats)

    res.json({
      success: true,
      data: formattedStats,
    })
  } catch (error) {
    console.error("❌ Error calculating project stats:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors du calcul des statistiques",
      error: error.message,
    })
  }
}

// Get projects as GeoJSON
const getProjectsGeoJSON = async (req, res) => {
  try {
    console.log("🗺️ Fetching projects as GeoJSON...")

    const projects = await Project.find({
      $or: [{ latitude: { $exists: true, $ne: null } }, { coordonneesX: { $exists: true, $ne: null } }],
    }).populate("maitreOuvrage", "name email phone")

    const features = projects
      .map((project) => {
        let coordinates = []

        if (project.latitude && project.longitude) {
          coordinates = [Number.parseFloat(project.longitude), Number.parseFloat(project.latitude)]
        } else if (project.coordonneesX && project.coordonneesY) {
          // Convert Lambert coordinates to WGS84 if needed
          coordinates = [Number.parseFloat(project.coordonneesX), Number.parseFloat(project.coordonneesY)]
        }

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates,
          },
          properties: {
            id: project._id,
            projectNumber: project.projectNumber,
            status: project.projectStatus,
            region: project.region,
            prefecture: project.prefecture,
            consistance: project.consistance,
            maitreOuvrage: project.maitreOuvrage?.name,
          },
        }
      })
      .filter((feature) => feature.geometry.coordinates.length === 2)

    const geoJSON = {
      type: "FeatureCollection",
      features,
    }

    console.log(`✅ Generated GeoJSON with ${features.length} features`)

    res.json({
      success: true,
      data: geoJSON,
    })
  } catch (error) {
    console.error("❌ Error generating GeoJSON:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération des données géographiques",
      error: error.message,
    })
  }
}

// Create project from GeoJSON data
const createProjectFromGeoJSON = async (req, res) => {
  try {
    console.log("🗺️ Creating project from GeoJSON:", req.body)

    const { name, description, geoJsonData } = req.body

    // Validate required fields
    if (!name || !geoJsonData) {
      return res.status(400).json({
        success: false,
        message: "Le nom du projet et les données GeoJSON sont requis",
      })
    }

    // Generate unique project number
    const projectNumber = `GEO-${Date.now()}`

    // Calculate center coordinates from GeoJSON features
    let centerLat = 0, centerLng = 0, pointCount = 0

    if (geoJsonData.features && geoJsonData.features.length > 0) {
      geoJsonData.features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
          centerLng += feature.geometry.coordinates[0]
          centerLat += feature.geometry.coordinates[1]
          pointCount++
        }
      })

      if (pointCount > 0) {
        centerLng = centerLng / pointCount
        centerLat = centerLat / pointCount
      }
    }

    // Create project with GeoJSON data
    const projectData = {
      projectNumber,
      anneeProjet: new Date().getFullYear(),
      maitreOuvrage: {
        name: "GeoJSON Import",
        email: "geojson@example.com"
      },
      region: "Casablanca-Settat", // Default region
      prefecture: "Casablanca",
      consistance: description || `Projet créé à partir de données GeoJSON avec ${geoJsonData.features?.length || 0} éléments`,
      projectStatus: "En cours",
      latitude: centerLat || 33.589886,
      longitude: centerLng || -7.620037,
      geoJsonData: geoJsonData, // Store the GeoJSON data
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const project = new Project(projectData)
    await project.save()

    console.log("✅ GeoJSON project created:", project._id)

    res.status(201).json({
      success: true,
      data: project,
      message: "Projet GeoJSON créé avec succès",
    })
  } catch (error) {
    console.error("❌ Error creating GeoJSON project:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du projet GeoJSON",
      error: error.message,
    })
  }
}

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getProjectsGeoJSON,
  createProjectFromGeoJSON,
}
