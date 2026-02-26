// Import dependencies
const express = require("express");
const cors = require("cors");
const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'requests.log');

// Create the Express application instance
const app = express();

// Enable middleware
// 1. CORS
app.use(cors())
// 2. JSON parsing
app.use(express.json())
app.use((req, res, next) => {
  const start = Date.now();
  // Capture the original res.send
  const originalSend = res.send.bind(res);
  res.send = (body) => {
    const duration = Date.now() - start;
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      headers: req.headers,
      body: req.body,
      status: res.statusCode,
      responseHeaders: res.getHeaders(),
      responseBody: body,
      durationMs: duration,
    };
    // Append log entry as a JSON string
    fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + ',\n');
    return originalSend(body);
  };
  next();
});
// 3. static file serving
app.use("/api/uploads", express.static(process.env.UPLOAD_DIR || "uploads"));


app.get("/", (req, res) => {
    res.send("Food Planner API Running")
})

const foodRoutes = require("./routes/food");
app.use("/api/foods", foodRoutes);

const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

const unitRoutes = require("./routes/unit");
app.use("/api/units", unitRoutes);

const ingredientRoutes = require("./routes/ingredient");
app.use("/api/ingredients", ingredientRoutes);

const mealRoutes = require("./routes/meal");
app.use("/api/meals", mealRoutes);

app.use((err, req, res, next) => {
    console.error("🔥 ERROR STACK:", err.stack);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error"
    });
});

if (process.env.NODE_ENV === "development") {
  app.post("/test/reset-db", async (req, res) => {
    console.log("⚡ Received request to reset dev DB from selenium");
    try {
      const { runMigrations } = require("../database/migrate");
      await runMigrations();
      console.log("✅ Dev DB reset complete");
      res.json({ status: "ok" });
    } catch (err) {
      console.error("❌ Failed to reset DB:", err);
      res.status(500).json({ error: err.message });
    }
  });
}


module.exports = app;