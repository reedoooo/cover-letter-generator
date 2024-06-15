const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { generate } = require("../controllers/coverLetterController");

router.post("/create", upload.single("pdfFile"), generate);

module.exports = router;
