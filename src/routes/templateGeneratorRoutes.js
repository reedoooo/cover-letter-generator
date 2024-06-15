const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { createTemplate, reviseTemplate } = require('../controllers/templateGeneratorController');

router.post('/create', upload.single('pdfFile'), createTemplate);
router.post('/revise', upload.single('pdfFile'), reviseTemplate);

module.exports = router;
