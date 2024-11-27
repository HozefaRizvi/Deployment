const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users", // Assuming you have a User model
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cars",
    },
    type: {
      type: String,
      required: true,
      enum: ["info", "bidAccepted", "carBought"],
    },
    body: {
      type: String,
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notifications", notificationSchema);
