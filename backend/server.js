const assetRequestRoutes = require("./routes/assetRequestRoutes");
const assetRoutes = require("./routes/assetRoutes");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api/requests", assetRequestRoutes);
app.use("/api/assets", assetRoutes);

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;

console.log("🔥 PORT FROM ENV =", PORT);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error(err));
