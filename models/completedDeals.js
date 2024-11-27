const mongoose = require("mongoose");
const CompletedSchema = new mongoose.Schema(
  {
    car: { type: mongoose.Schema.Types.ObjectId, ref: "cars", required: true },
    boughtBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    buyingAmount: { type: Number, required: true },
    dealDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("completeddeals", CompletedSchema);
