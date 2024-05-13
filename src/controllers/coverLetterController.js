const logger = require("../config/winston");
const aiService = require("../services/aiService");
exports.generate = async (req, res) => {
  try {
    const result = await aiService.generateCoverLetter(req.body);
    const { coverLetterHtml, draftContentState } = result;
    // req.session.draft = draftContentState;
    res.status(200).json({
      coverLetter: coverLetterHtml,
      draftContentState: draftContentState,
      metadata: {
        generatedDate: new Date().toISOString(), // Example metadata
        version: "1.0", // You can version your output format if needed
      },
    });
  } catch (error) {
    logger.error(`Error generating cover letter: ${error.message}`);
    res
      .status(500)
      .json({ message: "Error generating cover letter", error: error.message });
  }
};

exports.saveDraft = async (req, res) => {
  try {
    let { content, contentName, userId } = req.body;
    const savedDraft = await aiService.saveDraftToDatabase(
      content,
      contentName,
      userId
    );
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
