const express = require('express');
const Car = require('../models/Car');
const router = express.Router();
const authMiddleware = require('../Middleware/authmiddleware');
const User  = require('../models/User')
const Watchlist = require('../models/WatchList')
router.post('/listnewcar', authMiddleware, async (req, res) => {
  console.log('Incoming request body:', req.body);
  console.log('User object:', req.user); 

  const {
    make, model, variant, condition, pictures, videoUrl, priceForTraders, traderDiscount, description,
    registration, transmission, engine, mileage, fuel, colour, trim, totalOwners, motDate, regDate,
    specifications, status, history, location, comments, bidMaturity, buyNowPrice,
  } = req.body;
  try {
    // Check if user object is defined
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const discountAmount = priceForTraders * (traderDiscount / 100);
    const priceForPublic = priceForTraders - discountAmount;
    console.log("Price for trader",priceForTraders)  // to debug, this should print the discount amount
    console.log("Price for public",priceForPublic)
    console.log("Price for discount",traderDiscount)
    const car = new Car({
      make,
      model,
      variant,
      condition,
      pictures,
      videoUrl,
      priceForTraders,
      priceForPublic,  
      traderDiscount,
      description,
      registration,
      transmission,
      engine,
      mileage,
      fuel,
      colour,
      trim,
      totalOwners,
      motDate,
      regDate,
      specifications,
      status,
      history,
      location,
      comments,
      bidMaturity,
      buyNowPrice,
      listedBy: user._id,   
      userType: user.userType, 
      listingDate: new Date()  
    });
    
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    console.log("error", error);
    res.status(500).send('Server error');
  }
});
router.get('/getallcars', async (req, res) => {
    try {
        const cars = await Car.find();
        res.status(200).json(cars); 
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});
router.get('/getspecificcar/:carid', async (req, res) => {
  try {
      const carId = req.params.carid; // Get carid from request parameters
      const car = await Car.findById(carId); // Find car by its ID

      if (!car) {
          return res.status(404).json({ message: 'Car not found' });
      }

      res.status(200).json(car); // Send the car data in response
  } catch (error) {
    console.error('Server error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/last-week', async (req, res) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); 
    try {
        const cars = await Car.find({ createdAt: { $gte: oneWeekAgo } }); 
        console.log(cars)
        res.status(200).json(cars); 
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});
router.get('/myadds/:userId', async (req, res) => {
  const userId = req.params.userId; 
  try {
      const cars = await Car.find({ listedBy: userId }); 
      res.status(200).json(cars); 
  } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Route to add a car to the watchlist
router.post('/addtowatchlist/:carId/:userId', async (req, res) => {
  const { carId, userId } = req.params;
  try {
      const car = await Car.findById(carId);
      if (!car) {
          return res.status(404).json({ message: 'Car not found' });
      }

      // Assuming there's a Watchlist model to store user watchlists
      const watchlistEntry = new Watchlist({ userId, carId });
      await watchlistEntry.save(); // Save the watchlist entry

      res.status(201).json({ message: 'Car added to watchlist' });
  } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Route to remove a car from the watchlist
router.delete('/removefromwatchlist/:carId/:userId', async (req, res) => {
  const { carId, userId } = req.params;
  try {
      const result = await Watchlist.deleteOne({ userId, carId }); // Delete the watchlist entry
      if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Watchlist entry not found' });
      }

      res.status(200).json({ message: 'Car removed from watchlist' });
  } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Route to get all cars in a user's watchlist
router.get('/watchlist/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
      const watchlist = await Watchlist.find({ userId }); // Get the watchlist for the user
      const carIds = watchlist.map(entry => entry.carId); // Extract car IDs

      const cars = await Car.find({ _id: { $in: carIds } }); // Find cars in watchlist
      res.status(200).json(cars);
  } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
  }
});
module.exports = router;
