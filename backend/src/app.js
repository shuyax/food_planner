// Import dependencies
const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Load variables from .env into process.env right away.

// Create the Express application instance
const app = express();

// Enable middleware
// 1. CORS
app.use(cors())
// 2. JSON parsing
app.use(express.json())
// 3. static file serving
app.use("/uploads", express.static(process.env.UPLOAD_DIR || "uploads"));


app.get("/", (req, res) => {
    res.send("Food Planner API Running")
})

const foodRoutes = require("./routes/food");
app.use("/foods", foodRoutes);

const uploadRoutes = require("./routes/upload");
app.use("/upload", uploadRoutes);

const unitRoutes = require("./routes/unit");
app.use("/units", unitRoutes);

const ingredientRoutes = require("./routes/ingredient");
app.use("/ingredients", ingredientRoutes);

const mealRoutes = require("./routes/meal");
app.use("/meals", mealRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error"
    });
});


module.exports = app;