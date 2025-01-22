const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('../config/db'); // Adjusted path
const emailRoutes = require('../routes/emailRoutes'); // Adjusted path
const fs = require('fs');
const app = express();
require('dotenv').config();

const uploadDir = path.join(__dirname, '../uploads'); // Adjusted path

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware

app.use(cors({
  origin: '*', // Allow all origins (or specify your frontend's domain for better security)
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
module.exports = app;
