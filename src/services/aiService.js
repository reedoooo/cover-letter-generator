const logger = require("../config/winston");
const User = require("../models/User");
const { scrapeLinkedInJobListing } = require("../utils/dataUtilities");
const {
  createCoverLetterHtml,
  createDraftContentState,
} = require("../utils/fileConversionUtilities");
const {
  replacePlaceholders,
  convertDraftContentStateToPlainText,
  replaceUnsupportedCharacters,
} = require("../utils/genUtilities");
const {
  createPrompt,
  fetchOpenAIResponse,
} = require("../utils/openAiUtilities");
const { generatePDF, savePDF } = require("../utils/pdfUtilities");

exports.generateCoverLetter = async (
  formValues,
  pdfFile,
  pdfText,
  pdfUrl,
  linkedInUrl
) => {
  const {
    yourName,
    yourAddress,
    cityStateZip,
    emailAddress,
    phoneNumber,
    date,
    companyAddress,
    companyCityStateZip,
    skills,
    projects,
    companyName,
    employerName,
    jobTitle,
  } = formValues;
  let jobData = {};
  if (linkedInUrl) {
    try {
      jobData = await scrapeLinkedInJobListing(linkedInUrl);
      logger.info(`Scraped: ${JSON.stringify(jobData)}`);
    } catch (error) {
      logger.error(
        `Error scraping LinkedIn job listing: ${error.message}`,
        error
      );
    }
  }

  const finalJobTitle = jobData.jobTitle || "the position";
  const finalCompanyName = jobData.companyName || "the company";
  const finalJobDescription = jobData.jobDescription || "Not provided";
  const finalJobRequirements = jobData.jobRequirements || "Not provided";
  const finalSkills = skills || jobData.skills || "Not provided";
  const finalQualifications = jobData.qualifications || "Not provided";
  const finalCompanyCulture = jobData.companyCulture || "Not provided";
  const finalBenefits = jobData.benefits || "Not provided";

  const prompt = createPrompt({
    finalJobTitle,
    finalCompanyName,
    finalJobDescription,
    finalJobRequirements,
    finalQualifications,
    finalCompanyCulture,
    finalBenefits,
    finalSkills,
    pdfText,
  });

  try {
    let generatedTextResponse = await fetchOpenAIResponse(prompt);
    generatedTextResponse = replaceUnsupportedCharacters(generatedTextResponse);

    const placeholders = {
      "[Your Name]": yourName || "Not provided",
      "[Your Address]": yourAddress || "Not provided",
      "[City, State, Zip Code]": cityStateZip || "Not provided",
      "[Email Address]": emailAddress || "Not provided",
      "[Phone Number]": phoneNumber || "Not provided",
      "[Date]": new Date().toLocaleDateString(),
      "Hiring Manager": employerName,
      "the company": finalCompanyName,
      "[Company Address]": companyAddress || "Not provided",
      "[Company City, State, Zip Code]": companyCityStateZip || "Not provided",
    };

    const generatedText = replacePlaceholders(
      generatedTextResponse,
      placeholders
    );
    logger.info(`[GENERATED COVER LETTER] ${generatedText}`);
    const htmlContent = createCoverLetterHtml({
      yourName: yourName,
      jobTitle,
      companyName,
      pdfText,
      finalJobDescription,
      finalJobRequirements,
      finalQualifications,
      finalSkills,
    });
    const draftContentState = createDraftContentState({
      yourName,
      jobTitle,
      companyName,
      pdfText,
      finalJobDescription,
      finalJobRequirements,
      finalQualifications,
      finalSkills,
    });
    const pdfBytes = await generatePDF(generatedText);
    const pdfPath = savePDF(pdfBytes);

    return {
      rawTextResponse: generatedText,
      coverLetterHtml: htmlContent, // Assuming generatedText is HTML-safe
      draftContentState: draftContentState,
      pdfBytes,
      pdfPath,
    };
  } catch (error) {
    logger.error(`Error generating cover letter: ${error.message}`, error);
    throw error;
  }
};
// exports.saveDraftToDatabase = async (content, contentName, userId) => {
//   try {
//     const plainText = convertDraftContentStateToPlainText(content);
//     const user = await User.findById(userId);
//     if (!user) {
//       throw new Error("User not found");
//     }
//     const draftKey = `Draft ${user.coverLetters.size + 1}`;
//     user.coverLetters.set(draftKey, {
//       name: contentName,
//       content: plainText,
//       createdAt: new Date(), // Set current time if it's a new draft
//       updatedAt: new Date(), // Update time every time this is saved
//     });
//     await user.save();
//     return user.coverLetters.get(draftKey);
//   } catch (error) {
//     logger.error(`Error saving draft to database: ${error.message}`);
//     throw error; // Rethrow the error for further handling if necessary
//   }
// };
