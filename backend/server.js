const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');
const testRoutes = require( "./routes/test.js");

dotenv.config();
connectDB();

const app = express(); 

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// mongodb connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://mongodb://localhost:27017/signup-requests", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
    .catch((err) => console.log('connection failed', err));

app.use("/api/signup", signupRoutes);

app.get('/health', (req, res)=>{
    res.status(200).json({message: 'Server is running'});
});

// error handler middleware
app.use((err, req, res, next) =>{
    console.error(err.stack)
    res.status(500).json({ message: ' Server Error', error:process.env.NODE_ENV === "development" ? err.message:{},
    });
});

// 404 handler 
app.use("*", (req, res)=> {
    res.status(404).json({message: "Router non trouvée"});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;