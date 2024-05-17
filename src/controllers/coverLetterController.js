const fs = require("fs");
const path = require("path");
const logger = require("../config/winston");
const {
  generateCoverLetter,
  saveDraftToDatabase,
} = require("../services/aiService");

exports.generate = async (req, res) => {
  try {
    const { rawInputValues, pdfText, pdfUrl, linkedInUrl } = req.body;
    const pdfFile = req.file;

    logger.info(
      `Generating cover letter for user: ${JSON.stringify(rawInputValues)}`
    );
    logger.info(`File: ${pdfFile ? pdfFile.originalname : "No file"}`);
    logger.info(`Resume text: ${pdfText}`);
    logger.info(`Resume URL: ${pdfUrl}`);

    const result = await generateCoverLetter(
      rawInputValues,
      pdfFile,
      pdfText,
      pdfUrl,
      linkedInUrl
    );
    const { coverLetterHtml, draftContentState, pdfBytes } = result;
    const pdfOptions = { format: "A4" };

    const pdfPath = path.join(__dirname, "../generated/cover_letter.pdf");
    fs.writeFileSync(pdfPath, pdfBytes);

    res.status(200).json({
      coverLetter: coverLetterHtml,
      draftContentState: draftContentState,
      pdfUrl: `http://localhost:3000/generated/cover_letter.pdf`,
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
