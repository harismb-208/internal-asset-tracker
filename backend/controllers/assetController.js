const Asset = require("../models/Asset");

exports.createAsset = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ message: "Name and type are required" });
    }

    const asset = await Asset.create({ name, type });
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
