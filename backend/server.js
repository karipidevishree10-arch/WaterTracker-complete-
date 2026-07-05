require("dotenv").config();

const express = require("express");
const cors = require("cors");

// Import database (this creates the table if it doesn't exist)
require("./db");

// Import routes
const waterRoutes = require("./routes/waterRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Water Tracker Backend is Running!"
  });
});

// API Routes
app.use("/water", waterRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("Welcome to Water Tracker API 🚰");
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});