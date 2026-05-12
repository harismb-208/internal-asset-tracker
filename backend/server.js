const assetRequestRoutes = require("./routes/assetRequestRoutes");
const assetRoutes = require("./routes/assetRoutes");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

// CORS configuration
app.use(
  cors({
    origin: [
      "https://internal-asset-tracker-bv22.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");

app.use("/api/requests", assetRequestRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Backend API is running");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Export app for Vercel
module.exports = app;