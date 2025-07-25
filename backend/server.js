// This MUST be the absolute first line
require('dotenv').config();

// Debug environment variables immediately after loading
console.log("🔍 Environment variables debug:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- PORT:", process.env.PORT);
console.log("- SMTP_USER:", process.env.SMTP_USER ? "✅ Loaded" : "❌ Missing");
console.log("- SMTP_PASS:", process.env.SMTP_PASS ? "✅ Loaded" : "❌ Missing");
console.log("- ADMIN_EMAIL:", process.env.ADMIN_EMAIL);

// Now import everything else
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const testRoutes = require('./routes/testRoutes');

// Import routes (these will now have access to env variables)
const authRoutes = require('./routes/authRoutes');
const signupRequestRoutes = require('./routes/signupRequest');
const adminRoutes = require('./routes/admin');
const projectRoutes = require('./routes/projectRoutes');
const secureGeoRoutes = require('./routes/secureGeoRoutes');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser()); // Parse cookies

// Routes
app.use('/api/authRoutes', authRoutes);
app.use('/api/signup-request', signupRequestRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/projects", projectRoutes)
app.use("/api/admin/projects", projectRoutes)
app.use('/api/test', testRoutes);
app.use('/api/secure-geo', secureGeoRoutes);
// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Geoporteil API is running!' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
});