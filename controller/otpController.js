const otpGenerator = require('otp-generator');
const OTP = require('../models/OTPModel');
const User = require('../models/User');

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user is registered
    const checkUserPresent = await User.findOne({ email });

    let otp;  // Declare otp variable here

    // If user is found, proceed with OTP generation
    if (checkUserPresent) {
      otp = otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
    }

    // Ensure OTP is unique in the OTP collection
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };
    const otpBody = await OTP.create(otpPayload);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      otp,
      email
    });

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
