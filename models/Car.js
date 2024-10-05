const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  make: { type: String, required: true },
  model: { type: String, required: true },
  variant: { type: String, required: true },
  condition: { type: String, required: true, enum: ['new', 'used'] },
  pictures: [{ type: String }], 
  videoUrl: { type: String },
  priceForTraders: { type: Number, required: true },
  priceForPublic: { 
    type: Number,
    required: true,
    default: function() {
      return this.priceForTraders * 1.2;  // Public price is 20% markup on trader price
    }
  },
  traderDiscount: { type: Number },
  description: { type: String },
  registration: { type: String, required: true },
  transmission: { type: String, required: true },
  engine: { type: String, required: true },
  mileage: { type: Number, required: true },
  fuel: { type: String, required: true },
  colour: { type: String, required: true },
  trim: { type: String },
  totalOwners: { type: Number, required: true },
  motDate: { type: Date },
  regDate: { type: Date, required: true },
  specifications: [{ type: String }],
  status: { type: String, enum: ['onsale', 'sold'], default: 'onsale' },
  history: { type: String },
  location: { type: String },
  comments: [{ type: String }],
  bidMaturity: { type: Number, required: true },
  buyNowPrice: { type: Number, required: true },

  // New Fields
  listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // New field
  userType: { type: String, enum: ['trader', 'individual'], required: true },  // Trader or Individual
  listingDate: { type: Date, default: Date.now },  // Date the car was listed
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
