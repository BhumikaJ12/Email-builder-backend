const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('../config/db'); // Database connection
const emailRoutes = require('../routes/emailRoutes'); // Email routes
const fs = require('fs');
const serverless = require('serverless-http'); // Required for serverless functions
require('dotenv').config(); // Load environment variables

const app = express();
const uploadDir = path.join(__dirname, '../uploads'); // Uploads directory

// Ensure the uploads folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors({
  origin: '*', // Replace with specific domains for production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(bodyParser.json());
app.use('/uploads', express.static(uploadDir));

// Routes
app.use('/api/emails', emailRoutes);

// Sync database
sequelize
  .sync()
  .then(() => console.log('Database synchronized'))
  .catch((err) => console.error('Database sync error:', err));

// Export the app as a serverless function
module.exports = serverless(app);
