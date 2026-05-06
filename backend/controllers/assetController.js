const Asset = require("../models/Asset");

exports.createAsset = async (req, res) => {
  try {
    const { name, type, totalQuantity } = req.body;

    if (!name || !type || totalQuantity === undefined) {
      return res.status(400).json({ message: "Name, type and total quantity are required" });
    }

    const asset = await Asset.create({ name, type, totalQuantity });
    res.status(201).json(asset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAssets = async (req, res) => {
  try {
    const assets = await Asset.find().populate("assignedTo", "name email");
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getMyAssets = async (req, res) => {
  try {
    const assets = await Asset.find({
      assignedTo: req.user.userId,
    });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getAvailableAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ status: "AVAILABLE" });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAssetsForUser = async (req, res) => {
  try {
    // For users, we don't populate assignedTo for privacy
    const assets = await Asset.find();
    res.json(assets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
