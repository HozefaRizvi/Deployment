const express = require("express");
const Car = require("../models/Car");
const router = express.Router();
const authMiddleware = require("../Middleware/authmiddleware");
const CompletedDeals = require('../models/completedDeals');
const Bidding = require('../models/Bidding');
const User = require("../models/User");
const Watchlist = require("../models/WatchList");
router.post("/listnewcar", authMiddleware, async (req, res) => {
  // console.log("Incoming request body:", req.body);
  // console.log("User object:", req.user);

  const {
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

    seats,
    totalOwners,
    motDate,
    regDate,
    specifications,

    carUniqueId,
    history,
    location,
    comments,
    bidMaturity,
    buyNowPrice,
    minimumBidPrice,
    bidAcceptTill,
    airbags,
    accidentHistory,
    parkingSensors,
    backupCamera,
    abs,
    bodyType,
    entertainmentSystem,
    wheels,
    tiresCondition,
    sunroof,
    fuelEconomy,
    cylinders,
    horsePower,
    carTitle,
    seatingMaterial,
    interiorColor,
    listedBy,
    userType,
    listingDate,
    inspectionMarks,
  } = req.body;
  const formattedInspectionMarks = Object.keys(inspectionMarks).map(
    (imageIndex) => ({
      imageIndex: Number(imageIndex),
      marks: inspectionMarks[imageIndex].map((mark) => ({
        x: mark.x,
        y: mark.y,
        type: mark.type,
      })),
    })
  );
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
    // console.log("Price for trader", priceForTraders);
    // console.log("Price for public", priceForPublic);
    // console.log("Price for discount", traderDiscount);
    console.log("Inspection Marks", inspectionMarks);
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
      totalOwners,
      motDate,
      regDate,
      specifications,
      history,
      location,
      comments,
      bidMaturity,
      buyNowPrice,
      listedBy: user._id,
      userType: user.userType,
      listingDate: new Date(),
      minimumBidPrice,
      bidAcceptTill,

      airbags,
      accidentHistory,
      parkingSensors,
      backupCamera,
      abs,
      bodyType,
      entertainmentSystem,
      wheels, //Exterior Features
      tiresCondition, //Exterior Features
      sunroof, //Exterior Features
      fuelEconomy,
      cylinders,
      horsePower,
      carTitle,
      seatingMaterial,
      interiorColor,
      seats,
      carUniqueId,

      listedBy,
      userType,
      listingDate,

      inspectionMarks: formattedInspectionMarks,
    });
    console.log("car", car);
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Server error");
  }
});
router.post("/validateID", authMiddleware, async (req, res) => {
  const { id } = req.body;
  try {
    const user = await Car.find({ carUniqueId: id });

    if (user.length < 1) {
      return res.status(200).json({ message: "Id is valid" });
    }
    res.status(201).json({ message: "Id already exist" });
  } catch (error) {
    console.log("error", error);
    res.status(500).send("Server error");
  }
});
router.get("/getallcars", async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
router.get("/getallcarspagination", async (req, res) => {
  const { page = 1, limit = 3 } = req.query;

  try {
    const cars = await Car.find({ status: "active" })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const totalCars = await Car.countDocuments({ status: "active" });
    res.status(200).json({
      cars,
      totalPages: Math.ceil(totalCars / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
router.get("/search", async (req, res) => {
  try {
    // Extract query parameters
    const {
      make,
      model,
      variant,
      minPrice,
      maxPrice,
      condition,
      fuel,
      transmission,
      colour,
      location,
      page = 1,
      limit = 10,
      sort, // Can be "alphabetical", "endingSoonest", or "endingLatest"
    } = req.query;

    // Build the query object dynamically
    const query = { status: "active" }; // Only include cars that are "on sale"

    // Create an array to hold the $or conditions
    const orConditions = [];

    // Check for make, model, and variant and add to the orConditions array
    if (make) {
      orConditions.push({ make: { $regex: make, $options: "i" } }); // Case-insensitive search
    }
    if (model) {
      orConditions.push({ model: { $regex: model, $options: "i" } });
    }
    if (variant) {
      orConditions.push({ variant: { $regex: variant, $options: "i" } });
    }
    if (location) {
      query.location = { $regex: location, $options: "i" }; // Case-insensitive search
    }

    // If there are any conditions, add them to the query
    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    if (minPrice || maxPrice) {
      query.buyNowPrice = {};
      if (!isNaN(Number(minPrice))) query.buyNowPrice.$gte = Number(minPrice);
      if (!isNaN(Number(maxPrice))) query.buyNowPrice.$lte = Number(maxPrice);

      if (Object.keys(query.buyNowPrice).length === 0) {
        delete query.buyNowPrice;
      }
    }

    // Pagination logic
    const skip = (page - 1) * limit;

    // Sorting logic
    let sortOptions = { createdAt: -1 }; // Default sorting: Newest first

    if (sort === "alphabetical") {
      sortOptions = { make: 1 }; // Sort by make alphabetically
    } else if (sort === "endingSoonest") {
      sortOptions = { bidAcceptTill: 1 }; // Closest bid acceptance date first
    } else if (sort === "endingLatest") {
      sortOptions = { bidAcceptTill: -1 }; // Farthest bid acceptance date first
    }

    // Execute query with pagination and sorting
    const cars = await Car.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort(sortOptions);

    // Get total count for pagination metadata
    const total = await Car.countDocuments(query);

    res.status(200).json({
      success: true,
      data: cars,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
});
router.get("/getspecificcar/:carid", async (req, res) => {
  try {
    const carId = req.params.carid; // Get carid from request parameters
    const car = await Car.findById(carId); // Find car by its ID

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json(car); // Send the car data in response
  } catch (error) {
    console.error("Server error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/last-week", async (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  try {
    const cars = await Car.find({ createdAt: { $gte: oneWeekAgo } });
    console.log(cars);
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
router.get("/myadds/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const cars = await Car.find({ listedBy: userId });
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
router.get("/won/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const completedDeals = await CompletedDeals.find({ boughtBy: userId }).populate('car');

    if (!completedDeals.length) {
      return res.status(404).json({ message: "No completed deals found." });
    }
    res.status(200).json(completedDeals);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});
router.get("/pending/:userId", async (req, res) => {
  const userId = req.params.userId;
  
  try {
    // Find pending bids where the user has placed a bid
    const pendingBids = await Bidding.find({ user: userId }).populate('car');
    
    // If no pending bids found
    if (!pendingBids.length) {
      return res.status(404).json({ message: "No pending bids found." });
    }

    // Return the pending bids
    res.status(200).json(pendingBids);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Route to add a car to the watchlist
router.post("/addtowatchlist/:carId/:userId", async (req, res) => {
  const { carId, userId } = req.params;
  try {
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Assuming there's a Watchlist model to store user watchlists
    const watchlistEntry = new Watchlist({ userId, carId });
    await watchlistEntry.save(); // Save the watchlist entry

    res.status(201).json({ message: "Car added to watchlist" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Route to remove a car from the watchlist
router.delete("/removefromwatchlist/:carId/:userId", async (req, res) => {
  const { carId, userId } = req.params;
  try {
    const result = await Watchlist.deleteOne({ userId, carId }); // Delete the watchlist entry
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Watchlist entry not found" });
    }

    res.status(200).json({ message: "Car removed from watchlist" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Route to get all cars in a user's watchlist
router.get("/watchlist/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const watchlist = await Watchlist.find({ userId }); // Get the watchlist for the user
    const carIds = watchlist.map((entry) => entry.carId); // Extract car IDs

    const cars = await Car.find({ _id: { $in: carIds } }); // Find cars in watchlist
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

//get the completed deal deetails if any 
router.post("/caruser-details-completed", async (req, res) => {
  try {
    const { carId, userId } = req.body;

    // Validate input
    if (!carId || !userId) {
      return res.status(400).json({ message: "carId and userId are required." });
    }

    // Check if the car exists
    const car = await Car.findById(carId).populate("listedBy", "firstName lastName email");
    if (!car) {
      return res.status(404).json({ message: "Car not found." });
    }

    // If user is the owner, show buyer details if car is sold
    if (car.listedBy._id.toString() === userId) {
      const completedDeal = await CompletedDeals.findOne({ car: carId }).populate(
        "boughtBy",
        "firstName lastName email phone userType"
      );

      if (completedDeal) {
        return res.status(200).json({
          message: "Buyer",
          buyerDetails: completedDeal.boughtBy,
        });
      } else {
        return res.status(200).json({ message: "NotSold" });
      }
    }

    // Check if the user bought the car
    const completedDeal = await CompletedDeals.findOne({ car: carId, boughtBy: userId }).populate(
      "car",
      "make model variant"
    );

    if (completedDeal) {
      return res.status(200).json({
        message: "Owner",
        ownerDetails: car.listedBy,
      });
    }

    // Check if the user has placed a bid on the car
    const bidding = await Bidding.findOne({ car: carId, user: userId });
    if (bidding) {
      // Bidders cannot view details unless they win the car
      return res.status(403).json({
        message: "Error",
      });
    }

    // If no association, deny access
    return res.status(403).json({ message: "NotAuthorised" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});
module.exports = router;
