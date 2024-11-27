// controllers/biddingController.js
const Car = require("../models/Car");
const Bidding = require("../models/Bidding");

const placeBid = async (req, res) => {
  const { carId } = req.body;
  const { bidAmount } = req.body;

  try {
    const car = await Car.findById(carId);

    // Check if the bid is below the bid maturity price
    // if (bidAmount < car.bidMaturity) {
    //   return res
    //     .status(400)
    //     .json({ msg: "Bid must be equal or greater than the maturity price" });
    // }

    // Check if the user has made a bid before
    const lastBid = await Bidding.findOne({
      user: req.user.id,
      car: carId,
    }).sort({ bidDate: -1 });

    // If user has a last bid, check if the new bid is higher
    if (lastBid && bidAmount <= lastBid.bidAmount) {
      return res
        .status(400)
        .json({ msg: "Bid must be higher than your last bid of "+ lastBid.bidAmount});
    }

    // Save the new bid
    const newBid = new Bidding({
      car: carId,
      user: req.user.id,
      bidAmount,
    });

    await newBid.save();
    res.status(201).json(newBid);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const getCurrentBid = async (req, res) => {
  const { carId } = req.params;

  try {
    const highestBid = await Bidding.findOne({ car: carId })
      .sort({ bidAmount: -1 })  // Sort by bid amount in descending order
      .populate("user", "firstName lastName");

    if (!highestBid) {
      return res.status(404).json({ msg: "No bids found for this car" });
    }

    res.json(highestBid);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const getLastBid = async (req, res) => {
  const { carId } = req.body;


  try {

    const lastBid = await Bidding.findOne({
      user: req.user.id,
      car: carId,
    }).sort({ bidDate: -1 });
    

    if (!lastBid) {
      return res.status(404).json({ msg: "No bids found for this user" });
    }

    res.status(200).json(lastBid);
    console.log("Sent ok ");
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const getAllBids = async (req, res) => {
  const { carId } = req.body;


  try {

    const bids = await Bidding.find({
      car: carId,
    }).sort({ bidDate: -1 });
    

    if (!bids) {
      return res.status(404).json({ msg: "No bids found for this user" });
    }

    res.status(200).json(bids);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

module.exports = {
  placeBid,
  getCurrentBid,
  getLastBid,getAllBids
};
