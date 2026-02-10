const express = require("express");
const router = express.Router();

const {
  createRequest,
  getAllRequests,
  updateRequestStatus,
  getMyRequests,
  returnAsset,
} = require("../controllers/assetRequestController");

const {
  verifyToken,
  requireRole,
} = require("../middleware/authMiddleware");

// USER creates request
router.post("/", verifyToken, requireRole("USER"), createRequest);

// USER views own requests
router.get("/my", verifyToken, requireRole("USER"), getMyRequests);

// USER returns asset
router.patch(
  "/return/:requestId",
  verifyToken,
  requireRole("USER"),
  returnAsset
);

// ADMIN views all requests
router.get("/", verifyToken, requireRole("ADMIN"), getAllRequests);

// ADMIN approves/rejects
router.patch(
  "/:requestId",
  verifyToken,
  requireRole("ADMIN"),
  updateRequestStatus
);

module.exports = router;
