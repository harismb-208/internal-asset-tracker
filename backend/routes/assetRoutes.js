const express = require("express");
const router = express.Router();

const {
  createAsset,
  getAllAssets,
  getMyAssets,
  getAvailableAssets,
  getAllAssetsForUser,
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
  "/available",
  verifyToken,
  requireRole("USER"),
  getAvailableAssets
);

router.get(
  "/list",
  verifyToken,
  requireRole("USER"),
  getAllAssetsForUser
);

router.get(
  "/my",
  verifyToken,
  requireRole("USER"),
  getMyAssets
);
