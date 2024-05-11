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

    const coverLetter = await aiService.generateCoverLetter(
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
    res.status(200).json({ coverLetter });
  } catch (error) {
    res.status(500).json({ message: "Error generating cover letter", error });
    console.log(error);
    throw error;
  }
};
