const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { generate, saveDraft } = require("../controllers/coverLetterController");

router.post("/generate-cover-letter", upload.single("pdfFile"), generate);
router.post("/save-draft", saveDraft);

module.exports = router;
