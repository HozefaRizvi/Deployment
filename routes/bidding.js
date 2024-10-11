// routes/bidding.js
const express = require('express');
const { placeBid, getCurrentBid, getLastBid,getAllBids } = require('../controller/biddingController');
const authMiddleware = require('../Middleware/authmiddleware');

const router = express.Router();

// Route to place a bid
router.post('/placebid', authMiddleware, placeBid);
router.get('/:carId/current-bid', getCurrentBid);
router.post('/lastbid', authMiddleware, getLastBid);

router.post('/getallbids', authMiddleware, getAllBids);

module.exports = router;
