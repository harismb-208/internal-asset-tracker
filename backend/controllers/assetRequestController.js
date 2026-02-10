const AssetRequest = require("../models/AssetRequest");
const Asset = require("../models/Asset");

exports.createRequest = async (req, res) => {
  try {
    const { assetId } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset || asset.status !== "AVAILABLE") {
      return res.status(400).json({ message: "Asset not available" });
    }

    const existing = await AssetRequest.findOne({
      asset: assetId,
      user: req.user.userId,
      status: "PENDING",
    });

    if (existing) {
      return res.status(400).json({ message: "Request already exists" });
    }

    const request = await AssetRequest.create({
      asset: assetId,
      user: req.user.userId,
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await AssetRequest.find()
      .populate("asset")
      .populate("user", "name email");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const request = await AssetRequest.findById(requestId).populate("asset");
    if (!request || request.status !== "PENDING") {
      return res.status(400).json({ message: "Invalid request" });
    }

    request.status = status;
    await request.save();

    if (status === "APPROVED") {
      request.asset.status = "ASSIGNED";
      request.asset.assignedTo = request.user;
      await request.asset.save();
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await AssetRequest.find({
      user: req.user.userId,
    }).populate("asset");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.returnAsset = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await AssetRequest.findById(requestId).populate("asset");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only the same user can return
    if (request.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (request.status !== "APPROVED") {
      return res.status(400).json({ message: "Asset not assigned" });
    }

    // Update request
    request.status = "RETURNED";
    await request.save();

    // Update asset
    request.asset.status = "AVAILABLE";
    request.asset.assignedTo = null;
    await request.asset.save();

    res.json({
      message: "Asset returned successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


