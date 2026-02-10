const mongoose = require("mongoose");

const assetRequestSchema = new mongoose.Schema(
  {
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Asset",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
  type: String,
  enum: ["PENDING", "APPROVED", "REJECTED", "RETURNED"],
  default: "PENDING",
},
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssetRequest", assetRequestSchema);
