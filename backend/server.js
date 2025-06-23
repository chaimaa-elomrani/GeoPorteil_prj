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

app.get("/", (req, res) => {
    res.send("Api is running");
});

app.use("/api/test", testRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});