const express = require("express");
const router = express.Router();

const {
  createAsset,
  getAllAssets,
  getMyAssets, // 👈 ADD THIS
} = require("../controllers/assetController");

const {
  verifyToken,
  requireRole,
} = require("../middleware/authMiddleware");

// ADMIN only
router.post("/", verifyToken, requireRole("ADMIN"), createAsset);
router.get("/", verifyToken, requireRole("ADMIN"), getAllAssets);

module.exports = router;

router.get(
  "/my",
  verifyToken,
  requireRole("USER"),
  getMyAssets
);
