// Import dependencies
const express = require("express");
const cors = require("cors");
// require("dotenv").config(); // Load variables from .env into process.env right away.

// Create the Express application instance
const app = express();

// Enable middleware
// 1. CORS
app.use(cors())
// 2. JSON parsing
app.use(express.json())
app.use((req, res, next) => {
  console.log("---- Incoming Request ----");
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("--------------------------");
  const originalSend = res.send.bind(res);
  res.send = (body) => {
    console.log("---- Outgoing Response ----");
    console.log("Status:", res.statusCode);
    console.log("Headers:", res.getHeaders());
    console.log("Body:", body); // This is the actual response data
    console.log("---------------------------");
    return originalSend(body); // send the response as usual
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
      const { runMigrations } = require("./database/migrate");
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