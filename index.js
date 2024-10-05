const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/car');
const porfileroutes = require('./routes/profile')
const bodyParser = require('body-parser');  
const cors = require('cors');

dotenv.config();  // Load environment variables from .env file

const app = express();  // Initialize the express application
app.use(cors());  // Use cors middleware
const PORT = process.env.PORT || 3000;

app.use(express.json());  // Parse incoming JSON requests
app.use('/api/auth', authRoutes);  // Define routes for authentication
app.use('/api/cars', carRoutes);  // Define routes for car-related operations
app.use('/api/profiles', porfileroutes);  // Define routes for profile-related operations

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
