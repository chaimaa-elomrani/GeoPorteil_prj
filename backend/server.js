const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables FIRST
dotenv.config();
connectDB();

const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const authRoutes = require('./routes/authRoutes');
app.use("/api/auth", authRoutes);
const signupRoutes = require('./routes/signup');
app.use("/api/signup", signupRoutes);

// ENLEVEZ le try/catch pour voir l'erreur
console.log('🔧 Loading admin routes...');
const adminroutes = require('./routes/adminDashboard');
app.use("/api/admin", adminroutes);
console.log('✅ admin routes loaded');


// Test route
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' }); 
});



// 404 handler
app.use("*", (req, res) => {
    console.log("404 - Route not found:", req.method, req.originalUrl);
    res.status(404).json({ message: "Route non trouvée" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});