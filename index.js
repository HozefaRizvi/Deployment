const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const carRoutes = require("./routes/car");
const porfileroutes = require("./routes/profile");
const otproutes = require("./routes/Otproutes");
const biddingRoutes = require("./routes/bidding");
const bodyParser = require("body-parser");
const cors = require("cors");
const NotifRouter = require("./routes/notificationRoutes");

dotenv.config();

const app = express();
app.use(cors());
const PORT = 3005;

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/profiles", porfileroutes);
app.use("/api/otp", otproutes);
app.use("/api/bidding", biddingRoutes);
app.use("/api/notifications", NotifRouter);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("Error connecting"));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
