const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    make: { type: String, required: true },
    model: { type: String, required: true },
    variant: { type: String, required: true },
    condition: { type: String, required: true },
    pictures: [{ type: String }],
    videoUrl: { type: String },
    priceForTraders: { type: Number, required: true },
    priceForPublic: { type: Number, required: false },
    traderDiscount: { type: Number, required: true },
    description: { type: String },
    registration: { type: String, required: true },
    transmission: { type: String, required: true },
    engine: { type: String, required: true },
    mileage: { type: String, required: true },
    fuel: { type: String, required: true },
    colour: { type: String, required: true },

    totalOwners: { type: String, required: true },

    regDate: { type: Date, required: true },
    specifications: [{ type: String }],
    status: {
      type: String,
      enum: ["active", "sold", "unlisted"],
      default: "active",
    },
    // carUniqueId: { type: String, required: true },
    history: { type: String },
    location: { type: String, required: true },
    comments: [{ type: String }],
    bidMaturity: { type: Number, required: true },
    buyNowPrice: { type: Number, required: true },
    minimumBidPrice: { type: Number, required: true },
    airbags: { type: String },
    accidentHistory: { type: String },
    parkingSensors: { type: String },
    backupCamera: { type: String },
    abs: { type: String },
    bodyType: { type: String },
    entertainmentSystem: { type: String },
    wheels: { type: String },
    tiresCondition: { type: String, required: true },
    sunroof: { type: String },
    fuelEconomy: { type: String },
    cylinders: { type: String },
    horsePower: { type: String },
    carUniqueId: { type: String },
    carTitle: { type: String, required: true },
    seats: { type: Number, required: true },
    seatingMaterial: { type: String },
    interiorColor: { type: String },

    listedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    userType: { type: String, enum: ["trader", "individual"], required: true },
    listingDate: { type: Date, default: Date.now },
    bidAcceptTill: { type: Date, required: true },
    maturityStatus: { type: Boolean, default: false },
    inspectionMarks: [
      {
        imageIndex: { type: Number, required: false },
        marks: [
          {
            x: { type: Number, required: false },
            y: { type: Number, required: false },
            type: {
              type: String,
              enum: ["damage", "scrape", "dent"],
              required: false,
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("cars", carSchema);
