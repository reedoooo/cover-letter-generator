const logger = require("../config/winston");
const User = require("../models/User");
const { PDFDocument } = require("pdf-lib");
const {
  convertDraftContentStateToPlainText,
  loadPdf,
  scrapeLinkedInJobListing,
} = require("../utils");
import OpenAI from "openai";

function getOpenaiClient() {
  const chat = new OpenAI({
    openAi: process.env.OPENAI_API_KEY,
    modelName: "gpt-3.5-turbo",
  });
  return chat;
}
exports.generateCoverLetter = async (
  rawInputValues,
  pdfFile,
  pdfText,
  pdfUrl,
  linkedInUrl
) => {
  const {
    yourName,
    emailAddress,
    phoneNumber,
    skills,
    projects,
    companyName,
    employerName,
    jobTitle,
  } = rawInputValues;

  let resumeText = "";
  if (pdfFile) {
    resumeText = await loadPdf(pdfFile.path);
  } else {
    resumeText = pdfText;
  }

  // Scrape LinkedIn job listing
  let jobData = {};
  if (linkedInUrl) {
    jobData = await scrapeLinkedInJobListing(linkedInUrl);
  }

  const prompt = `
  Write a professional cover letter for a position of ${jobTitle || jobData.jobTitle} at ${companyName || jobData.companyName}.
  Here are the details:
  - Job Title: ${jobTitle || jobData.jobTitle}
  - Company Name: ${companyName || jobData.companyName}
  - Job Description: ${jobData.jobDescription}
  - Responsibilities: ${jobData.responsibilities}
  - Qualifications: ${jobData.qualifications}
  - Company Culture: ${jobData.companyCulture}
  - Benefits: ${jobData.benefits}
  - Highlight the following skills: ${skills || jobData.skills}
  - Include details from the following resume: ${resumeText}
  `;

  const { chat } = getOpenaiClient();

  // const prompt = `Write a professional cover letter for a position of ${jobTitle || jobData.jobTitle} at ${companyName || jobData.companyName}. Highlight the following skills: ${skills || jobData.skills}. Include details from the following resume: ${resumeText}.\nJob Description: ${jobData.jobDescription}\nJob Requirements: ${jobData.jobRequirements}`;
  try {
    const response = await chat.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    const generatedTextResponse = response.choices[0].text.trim();
    const placeholders = {
      "[Your Name]": yourName,
      "[Email Address]": emailAddress,
      "[Phone Number]": phoneNumber,
      "[Employer Name]": employerName,
      "[Company Name]": companyName,
      "[Job Title]": jobTitle,
      "[Skills]": skills,
      "[Projects]": projects,
    };

    const generatedText = generatedTextResponse.replace(
      /\[.*?\]/g,
      (match) => placeholders[match]
    );

    const coverLetterHtml = `<p>${generatedText.replace(/\n/g, "</p><p>")}</p>`;
    const draftContentState = {
      entityMap: {},
      blocks: generatedText.split("\n").map((text, index) => ({
        key: `block${index}`,
        text: text,
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      })),
    };

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(generatedText, {
      x: 50,
      y: page.getHeight() - 50,
      size: 12,
    });

    const pdfBytes = await pdfDoc.save();

    return {
      coverLetterHtml,
      draftContentState,
      pdfBytes,
    };
  } catch (error) {
    logger.error(`Error generating cover letter: ${error.message}`);
    throw error; // Rethrow the error for further handling if necessary
  }
};
exports.saveDraftToDatabase = async (content, contentName, userId) => {
  try {
    const plainText = convertDraftContentStateToPlainText(content);
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const draftKey = `Draft ${user.coverLetters.size + 1}`;
    user.coverLetters.set(draftKey, {
      name: contentName,
      content: plainText,
      createdAt: new Date(), // Set current time if it's a new draft
      updatedAt: new Date(), // Update time every time this is saved
    });
    await user.save();
    return user.coverLetters.get(draftKey);
  } catch (error) {
    logger.error(`Error saving draft to database: ${error.message}`);
    throw error; // Rethrow the error for further handling if necessary
  }
};
