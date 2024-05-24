const fs = require("fs");
const path = require("path");
const logger = require("../config/winston");
const { generateCoverLetter } = require("../services/aiService");
const { convertToRegularObject } = require("../utils/genUtilities");
const User = require("../models/User");
const { default: mongoose } = require("mongoose");
exports.generate = async (req, res) => {
  try {
    const pdfFile = req.file;
    const formData = req.body;
    const pdfText = formData.pdfText;
    const pdfUrl = formData.pdfUrl;
    const linkedInUrl = formData.linkedInUrl;
    let formValues = formData.formValues;
    if (typeof formValues === "string") {
      try {
        formValues = JSON.parse(formValues);
        logger.info("Parsed Raw Input Values:", formValues);
      } catch (error) {
        throw new TypeError("Failed to parse formValues JSON string");
      }
    }

    if (!Array.isArray(formValues)) {
      throw new TypeError("formValues should be an array");
    }
    const inputValues = convertToRegularObject(formValues);
    const result = await generateCoverLetter(
      inputValues,
      pdfFile,
      pdfText,
      pdfUrl,
      linkedInUrl
    );
    const {
      rawTextResponse,
      coverLetterHtml,
      draftContentState,
      pdfBytes,
      pdfPath,
    } = result;
    const relativePdfPath = `/generated/${path.basename(pdfPath)}`;
    logger.info(`PDF saved at: ${pdfPath}`);
    logger.info(`Returning relative PDF path: ${relativePdfPath}`);

    res.status(200).json({
      message: "Cover letter generated successfully",
      resPdfUrl: relativePdfPath,

      resText: rawTextResponse,
      resHTML: coverLetterHtml,
      resBlock: draftContentState,
      metadata: {
        generatedDate: new Date().toISOString(), // Example metadata
        version: "1.0", // You can version your output format if needed
      },
    });
  } catch (error) {
    logger.error(`Error generating cover letter: ${error.message}`);
    res.status(500).json({
      message: "Error generating cover letter",
      error: error.message,
    });
  }
};
exports.saveDraft = async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);
    const { draft, userId } = req.body;
    const { title, content } = draft;
    // Validate required fields
    if (!title || !content || !userId) {
      return res.status(400).json({
        message: "Missing required fields: content, contentName, or userId",
      });
    }

    // Validate userId and convert to ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }
    const objectId = await mongoose.Types.ObjectId.createFromHexString(userId);

    const user = await User.findById(objectId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newDraft = {
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    user.coverLetters.push(newDraft);
    await user.save();

    res
      .status(201)
      .json({ message: "Draft saved successfully", draft: newDraft });
  } catch (error) {
    console.error(`Error saving draft: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error saving draft", error: error.message });
  }
};
