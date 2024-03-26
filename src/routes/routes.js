const express = require('express');
const multer = require('multer');
const controller = require('./controller/Extract/ExtractCFe');

// Create an Express router
const router = express.Router();
const upload = multer();

router.post('/extractCFe', upload.single('file'), controller.uploadXML);

// Export the router for use in other parts of the application
module.exports = router;

