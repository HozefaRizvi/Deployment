const mongoose = require("mongoose");
const biddingSchema = new mongoose.Schema({
  car: { type: mongoose.Schema.Types.ObjectId, ref: "cars", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  bidAmount: { type: Number, required: true },
  bidDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model("biddings", biddingSchema);
