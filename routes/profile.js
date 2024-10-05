const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming User model is in the models folder
const authMiddleware = require('../Middleware/authmiddleware'); // Import the auth middleware

const router = express.Router();

// Route: Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Fetch the user based on the ID from the token
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route: Edit user profile
router.put('/profile', authMiddleware, async (req, res) => {
  const { firstName, lastName, address, city, country, postCode, phone, companyName, VATNumber } = req.body;

  // Build the profile fields
  const profileFields = {};
  if (firstName) profileFields.firstName = firstName;
  if (lastName) profileFields.lastName = lastName;
  if (address) profileFields.address = address;
  if (city) profileFields.city = city;
  if (country) profileFields.country = country;
  if (postCode) profileFields.postCode = postCode;
  if (phone) profileFields.phone = phone;
  if (companyName) profileFields.companyName = companyName;
  if (VATNumber) profileFields.VATNumber = VATNumber;

  try {
    // Find user by ID and update profile
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password'); // Exclude password from the response

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route: Change user password
router.put('/change-password', authMiddleware, async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ msg: 'Please enter both new password and confirm password' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }

  try {
    // Find the user based on the token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Save the updated user with new password
    await user.save();

    res.json({ msg: 'Password successfully updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
