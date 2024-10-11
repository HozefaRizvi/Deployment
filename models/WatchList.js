const mongoose = require('mongoose');

// Define the Watchlist schema
const WatchlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model
    },
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Car', // Reference to the Car model
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set to the current date
    },
});

// Create the Watchlist model
const Watchlist = mongoose.model('Watchlist', WatchlistSchema);

module.exports = Watchlist;
