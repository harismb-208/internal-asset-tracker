const mongoose = require("mongoose");

const assetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    totalQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    availableQuantity: {
      type: Number,
      default: 0,
    },
    assignedQuantity: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "OUT_OF_STOCK", "ASSIGNED"],
      default: "AVAILABLE",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// Middleware to initialize availableQuantity
assetSchema.pre("save", function (next) {
  if (this.isNew) {
    this.availableQuantity = this.totalQuantity;
  }
  
  if (this.availableQuantity <= 0) {
    this.status = "OUT_OF_STOCK";
  } else {
    this.status = "AVAILABLE";
  }
  next();
});

module.exports = mongoose.model("Asset", assetSchema);
