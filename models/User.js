const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema
const userSchema = new mongoose.Schema({
  userType: { type: String, required: true, enum: ['individual', 'trader'] },
  firstName: { type: String }, 
  lastName: { type: String },  
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },   
  city: { type: String },      
  country: { type: String },   
  postCode: { type: String }, 
  phone: { type: String },    
  companyName: { type: String }, 
  VATNumber: { type: String },  
  isNextGearCustomer: { type: Boolean },
});

// Password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
