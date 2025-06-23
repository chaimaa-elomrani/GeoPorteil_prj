const express = require('express');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db.js');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const signupRoutes = require('./routes/signup');
app.use("/api/signup", signupRoutes);

// Test route
app.get('/health', (req, res) => {
    res.status(200).json({message: 'Server is running'});
});

// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({message: "Route non trouvée"});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});