const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();
const { validateSignupData } = require('../Utils/handleUserType');
const loginLimiter = require('../Middleware/loginLimiter ')
// Signup Route
router.post('/signup', async (req, res) => {
  const {
    userType,
    firstName,
    lastName,
    email,
    password,
    address,
    city,
    country,
    postCode,
    phone,
    companyName,
    VATNumber,
    isNextGearCustomer,
    emiratesId,
    DrivingLicensePicUri,
    BillPicUri,
    BankStatementPicUri,
    DirectorName,
    PersonalAddressOfDirector,
    BusinessAddress,
  } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({ msg: 'User already exists. Please login or use a different email.' });
    }

    // Validate user data
    const errors = validateSignupData(userType, req.body);
    if (errors.length > 0) {
      return res.status(400).json({ msg: errors });
    }

    // Create a new user object
    const newUser = {
      userType,
      email,
      password,
      emiratesId,
      DrivingLicensePicUri,
      BillPicUri,
      BankStatementPicUri,
    };

    // Add additional fields for trader type
    if (userType === 'trader') {
      Object.assign(newUser, {
        firstName,
        lastName,
        city,
        postCode,
        phone,
        companyName,
        isNextGearCustomer,
        emiratesId,
        DrivingLicensePicUri,
        BillPicUri,
        BankStatementPicUri,
        DirectorName,
        PersonalAddressOfDirector,
        BusinessAddress,
      });
    }

    // Save the new user to the database
    user = new User(newUser);
    await user.save();
    res.status(201).json({ msg: 'User registered successfully.' });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ msg: 'Network issue. Please try again later.' });
    }
    res.status(500).json({ msg: 'Internal server error. Please try again later.' });
  }
});


// Login Route
router.post('/login', loginLimiter, [
  body('email').isEmail().withMessage('Please provide a valid email.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
], async (req, res) => {
  const { email, password } = req.body;

  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'Email not found. Please register or try again.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ msg: 'Incorrect password. Please try again.' });
    }
    const payload = { userId: user._id, userType: user.userType };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, email, payload });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ msg: 'Network issue. Please try again later.' });
    }
    res.status(500).json({ msg: 'Internal server error. Please try again later.' });
  }
});


// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Validate input
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, msg: 'Please provide both email and new password.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, msg: 'Email not found. Please register or try again.' });
    }
   
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, msg: 'Password updated successfully.' });
  } catch (error) {
    console.error(error.message);
    if (error.name === 'MongoNetworkError') {
      return res.status(503).json({ success: false, msg: 'Network issue. Please try again later.' });
    }
    res.status(500).json({ success: false, msg: 'Internal server error. Please try again later.' });
  }
});

module.exports = router;



