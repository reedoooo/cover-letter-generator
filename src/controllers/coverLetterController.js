const fs = require("fs");
const path = require("path");
const logger = require("../config/winston");
const {
  generateCoverLetter,
  saveDraftToDatabase,
} = require("../services/aiService");

exports.generate = async (req, res) => {
  try {
    const pdfFile = req.file;
    const formData = req.body;
    const rawInputValues = formData.rawInputValues;
    const pdfText = formData.pdfText;
    const pdfUrl = formData.pdfUrl;
    const linkedInUrl = formData.linkedInUrl;
    console.group("Cover Letter Generation");
    console.log("Raw Input Values:", rawInputValues);
    console.log("File:", pdfFile ? pdfFile.originalname : "No file");
    console.log("Resume text:", pdfText);
    console.log("Resume URL:", pdfUrl);
    console.log("LinkedIn URL:", linkedInUrl);
    console.groupEnd();
    const result = await generateCoverLetter(
      rawInputValues,
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
    // const pdfResPath = path.join(__dirname, "../generated/cover_letter.pdf");
    // fs.writeFileSync(pdfPath, pdfBytes);

    res.status(200).json({
      message: "Cover letter generated successfully",
      resPdfUrl: pdfPath,
      resText: rawTextResponse,
      resHmtl: coverLetterHtml,
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
