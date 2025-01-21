const express = require('express');
const multer = require('multer');
const path = require('path');
const EmailTemplate = require('../models/EmailTemplate');
const fs = require('fs');

const router = express.Router();

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null,  path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10MB
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type, only JPG, PNG, and GIF are allowed.'));
    }
    cb(null, true);
  },
});


// Fetch layout HTML
router.get('/getEmailLayout', (req, res) => {
  console.log('Get email layout route hit');
  const layoutPath = path.join(__dirname, '../public', 'layout.html');
  console.log(layoutPath);
  fs.readFile(layoutPath, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error loading layout');
    res.send(data);
  });
});

// Upload image
router.post('/uploadImage', upload.single('image'), (req, res) => {
  console.log('Image upload route hit');
  
  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // Return the file URL as the response
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// Save email template
router.post('/uploadEmailConfig', async (req, res) => {
  console.log('Received request:', req.body); // Log the request body
  try {
    const { title, content, footer, imageUrl } = req.body;
    console.log('Saving template:', { title, content, footer, imageUrl }); // Log extracted fields
    const newTemplate = await EmailTemplate.create({ title, content, footer, imageUrl });
    res.status(201).json(newTemplate);
  } catch (err) {
    console.error('Error saving template:', err);
    res.status(500).send('Failed to save email template');
  }
});

// Render and download email template
router.post('/renderAndDownloadTemplate', (req, res) => {
  const { title, content, footer, imageUrl } = req.body;

  const layoutPath = path.join(__dirname, '../public/layout.html');
  fs.readFile(layoutPath, 'utf8', (err, layout) => {
    if (err) return res.status(500).send('Error reading layout');

    const renderedHTML = layout
      .replace('{{title}}', title)
      .replace('{{content}}', content)
      .replace('{{footer}}', footer)
      .replace('{{imageUrl}}', imageUrl);

    res.attachment('email_template.html').send(renderedHTML);
  });
});

module.exports = router;
