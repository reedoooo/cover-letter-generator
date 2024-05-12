const express = require("express");
const router = express.Router();
const coverLetterController = require("../controllers/coverLetterController");
const validationMiddleware = require("../middlewares/validationMiddleware");

router.post(
  "/generate-cover-letter",
  validationMiddleware.validateCoverLetter,
  coverLetterController.generate
);
router.post("/save-draft", coverLetterController.saveDraft);

module.exports = router;
