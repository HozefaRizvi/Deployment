const mongoose = require("mongoose");

// Define the Watchlist schema
const WatchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "users", // Reference to the User model
  },
  carId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "cars", // Reference to the Car model
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set to the current date
  },
});

// Create the Watchlist model
const Watchlist = mongoose.model("watchlists", WatchlistSchema);

module.exports = Watchlist;
