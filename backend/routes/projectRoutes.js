const express = require("express")
const router = express.Router()
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getProjectsGeoJSON,
  createProjectFromGeoJSON,
} = require("../controllers/projectController")

// Middleware for logging requests
router.use((req, res, next) => {
  console.log(`🛣️ Project Route: ${req.method} ${req.originalUrl}`)
  next()
})

// Routes
router.get("/stats", getProjectStats)
router.get("/geojson", getProjectsGeoJSON)
router.get("/", getAllProjects)
router.get("/:id", getProjectById)
router.post("/", createProject)
router.post("/import-geojson", createProjectFromGeoJSON)
router.put("/:id", updateProject)
router.delete("/:id", deleteProject)

module.exports = router
