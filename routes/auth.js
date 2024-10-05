const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Validation function for signup data
const { validateSignupData } = require('../Utils/handleUserType');

// POST /signup route
router.post('/signup', async (req, res) => {
  const { userType, firstName, lastName, email, password, address, city, country, postCode, phone, companyName, VATNumber, isNextGearCustomer } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const errors = validateSignupData(userType, req.body);
    if (errors.length > 0) {
      return res.status(400).json({ msg: errors });
    }
    user = new User({
      userType,
      firstName: userType === 'trader' ? firstName : undefined,
      lastName: userType === 'trader' ? lastName : undefined,
      email,
      password,
      address: userType === 'trader' ? address : undefined,
      city: userType === 'trader' ? city : undefined,
      country,
      postCode: userType === 'trader' ? postCode : undefined,
      phone,
      companyName: userType === 'trader' ? companyName : undefined,
      VATNumber: userType === 'trader' ? VATNumber : undefined,
      isNextGearCustomer: userType === 'trader' ? isNextGearCustomer : undefined,
    });

    // Save the user to the database
    await user.save();

    // Create a JWT token
    const payload = { userId: user._id, userType: user.userType };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Send the token to the client
    res.status(201).json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});


// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = { userId: user._id, userType: user.userType };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ token });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
