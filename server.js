const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
const emailRoutes = require('./routes/emailRoutes');
const fs = require('fs');
const app = express();
require('dotenv').config();

const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/emails', emailRoutes);

// Sync database
sequelize
  .sync()
  .then(() => console.log('Database synchronized'))
  .catch((err) => console.error('Database sync error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
