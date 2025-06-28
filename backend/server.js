const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet'); // Sécurité HTTP headers
const loginLimiter = require('./middleware/loginLimiter');
const fileAccessControl = require('./middleware/fileAccessControl');

// Load environment variables FIRST
dotenv.config();
connectDB();

const cors = require('cors');
const app = express();

// Security middleware
app.use(helmet()); // Sécurise les headers HTTP
app.use(fileAccessControl); // Contrôle d'accès aux fichiers

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Limite la taille des requêtes
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


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