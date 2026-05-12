const AssetRequest = require("../models/AssetRequest");
const Asset = require("../models/Asset");

exports.createRequest = async (req, res) => {
  try {
    const { assetId, requestedQuantity } = req.body;

    if (!requestedQuantity || requestedQuantity < 1) {
      return res.status(400).json({ message: "Requested quantity must be at least 1" });
    }

    const asset = await Asset.findById(assetId);
    if (!asset || asset.status === "OUT_OF_STOCK") {
      return res.status(400).json({ message: "Asset not available" });
    }

    if (requestedQuantity > asset.availableQuantity) {
      return res.status(400).json({ message: `Only ${asset.availableQuantity} units available` });
    }

    const existing = await AssetRequest.findOne({
      asset: assetId,
      user: req.user.userId,
      status: "PENDING",
    });

    if (existing) {
      return res.status(400).json({ message: "You already have a pending request for this asset" });
    }

    const request = await AssetRequest.create({
      asset: assetId,
      user: req.user.userId,
      requestedQuantity,
      remainingAssignedQuantity: requestedQuantity,
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllRequests = async (req, res) => {
  console.log("🔍 FETCHING ALL REQUESTS (ADMIN)");
  try {
    const requests = await AssetRequest.find()
      .populate("asset")
      .populate("user", "name email");
    console.log(`✅ FOUND ${requests.length} REQUESTS`);
    res.json(requests);
  } catch (err) {
    console.error("❌ ERROR FETCHING REQUESTS:", err.message);
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
    
    if (status === "APPROVED") {
      // Re-verify availability at the time of approval
      if (request.requestedQuantity > request.asset.availableQuantity) {
        return res.status(400).json({ message: "Cannot approve: Requested quantity exceeds available stock" });
      }
      
      request.asset.availableQuantity -= request.requestedQuantity;
      request.asset.assignedQuantity += request.requestedQuantity;
      
      if (request.asset.availableQuantity <= 0) {
        request.asset.status = "OUT_OF_STOCK";
      }
      
      request.assignedDate = new Date();
      await request.asset.save();
    }
    
    await request.save();

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
    const { returnedQty } = req.body;

    if (!returnedQty || returnedQty < 1) {
      return res.status(400).json({ message: "Return quantity must be at least 1" });
    }

    const request = await AssetRequest.findById(requestId).populate("asset");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (!request.asset) {
      return res.status(404).json({ message: "Asset associated with this request was not found" });
    }

    // Only the same user can return
    if (request.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (request.status !== "APPROVED") {
      return res.status(400).json({ message: "Asset not assigned or already fully returned" });
    }

    if (returnedQty > request.remainingAssignedQuantity) {
      return res.status(400).json({ message: `Cannot return more than assigned (${request.remainingAssignedQuantity})` });
    }

    // Update asset
    request.asset.availableQuantity += returnedQty;
    request.asset.assignedQuantity -= returnedQty;
    request.asset.status = "AVAILABLE"; // At least one unit returned makes it available
    await request.asset.save();

    // Update request
    request.returnedQuantity += returnedQty;
    request.remainingAssignedQuantity -= returnedQty;

    if (request.remainingAssignedQuantity === 0) {
      request.status = "RETURNED";
    }

    await request.save();

    res.json({
      message: request.remainingAssignedQuantity === 0 
        ? "Asset fully returned successfully" 
        : `Successfully returned ${returnedQty} units. ${request.remainingAssignedQuantity} units remaining.`,
      request
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


