const express = require('express');
const Car = require('../models/Car');
const router = express.Router();
const authMiddleware = require('../Middleware/authmiddleware');
const User  = require('../models/User')

router.post('/listnewcar', authMiddleware, async (req, res) => {
  console.log('Incoming request body:', req.body);
  console.log('User object:', req.user); 

  const {
    make, model, variant, condition, pictures, videoUrl, priceForTraders, traderDiscount, description,
    registration, transmission, engine, mileage, fuel, colour, trim, totalOwners, motDate, regDate,
    specifications, status, history, location, comments, bidMaturity, buyNowPrice
  } = req.body;

  try {
     // Check if user object is defined
     if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Retrieve user information using the correct property name
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Create a new car entry
    const car = new Car({
      make,
      model,
      variant,
      condition,
      pictures,
      videoUrl,
      priceForTraders,
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

    // Save the car in the database
    await car.save();

    res.status(201).json(car);
  } catch (error) {
    console.error('Error occurred:', error);
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
      res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

router.get('/last-week', async (req, res) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); 
    try {
        const cars = await Car.find({ createdAt: { $gte: oneWeekAgo } }); 
        res.status(200).json(cars); 
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
