const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { generate, saveDraft } = require("../controllers/coverLetterController");

router.post("/create", upload.single("pdfFile"), generate);
router.post("/save", saveDraft);
router.put("/update/:draftId", upload.single("pdfFile"), saveDraft);
router.delete("/delete/:draftId", saveDraft);

module.exports = router;
