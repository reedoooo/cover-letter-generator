const fs = require("fs");
const path = require("path");
const logger = require("../config/winston");
const {
  generateCoverLetter,
  saveDraftToDatabase,
} = require("../services/aiService");
const { convertToRegularObject } = require("../utils/genUtilities");
exports.generate = async (req, res) => {
  try {
    const pdfFile = req.file;
    const formData = req.body;
    const pdfText = formData.pdfText;
    const pdfUrl = formData.pdfUrl;
    const linkedInUrl = formData.linkedInUrl;
    let rawInputValues = formData.rawInputValues;
    if (typeof rawInputValues === "string") {
      try {
        rawInputValues = JSON.parse(rawInputValues);
        logger.info("Parsed Raw Input Values:", rawInputValues);
      } catch (error) {
        throw new TypeError("Failed to parse rawInputValues JSON string");
      }
    }

    if (!Array.isArray(rawInputValues)) {
      throw new TypeError("rawInputValues should be an array");
    }
    const inputValues = convertToRegularObject(rawInputValues);
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

    res.status(200).json({
      message: "Cover letter generated successfully",
      resPdfUrl: pdfPath,
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
    let { content, contentName, userId } = req.body;
    const savedDraft = await saveDraftToDatabase(content, contentName, userId);
    if (!savedDraft) {
      throw new Error("Failed to save draft");
    }
    res.json({ message: "Draft saved successfully", savedDraft });
  } catch (error) {
    logger.error(`Error saving draft: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error saving draft", error: error.message });
  }
};
