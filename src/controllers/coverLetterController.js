const aiService = require("../services/aiService");
exports.generate = async (req, res) => {
  try {
    console.log("RECEIVED: ", req.body);
    const {
      url,
      yourName,
      address,
      cityStateZip,
      emailAddress,
      todayDate,
      employerName,
      companyName,
      companyAddress,
      companyCityStateZip,
      jobTitle,
      previousPosition,
      previousCompany,
      skills,
      softwarePrograms,
      reasons,
    } = req.body;

    const result = await aiService.generateCoverLetter(
      url, 
      yourName,
      address,
      cityStateZip,
      emailAddress,
      todayDate,
      employerName,
      companyName,
      companyAddress,
      companyCityStateZip,
      jobTitle,
      previousPosition,
      previousCompany,
      skills,
      softwarePrograms,
      reasons
    );
    const { coverLetterHtml, draftContentState } = result;

    // Return both in the response
    res.status(200).json({
      coverLetter: coverLetterHtml,
      draftContentState: draftContentState,
      metadata: {
        generatedDate: new Date().toISOString(), // Example metadata
        version: "1.0" // You can version your output format if needed
      }
    });
    // res.status(200).json({ coverLetter });
  } catch (error) {
    res.status(500).json({ message: "Error generating cover letter", error });
    console.log(error);
    throw error;
  }
};
