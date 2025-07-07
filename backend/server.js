const express = require("express")
const cors = require("cors")
const connectDB = require("./config/db")
const authRoutes = require("./routes/authRoutes")
const adminRoutes = require("./routes/admin")
const loginLimiter = require("./middleware/loginLimiter")
const clientRoutes = require('./routes/clientRoutes');
const fileAccessControl = require("./middleware/fileAccessControl")
const signupRequestRoutes = require('./routes/SignupRequest')

require("dotenv").config()

const app = express()

// Connect to MongoDB
connectDB()

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Security middleware
app.use(fileAccessControl)

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use('/api/clients', clientRoutes);
app.use('/api/signup-request', signupRequestRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  })
})


// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err)
  res.status(500).json({
    success: false,
    message: "Internal server error",
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 API URL: http://localhost:${PORT}/api`)
})


// clients routes