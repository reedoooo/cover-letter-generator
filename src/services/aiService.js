const config = require("../config/index");
const logger = require("../config/winston");
const User = require("../models/User");
const { convertDraftContentStateToPlainText } = require("../utils");

exports.generateCoverLetter = async (reqBody) => {
  const {
    url,
    yourName,
    address,
    cityStateZip,
    emailAddress,
    phoneNumber,
    todayDate,
    employerName,
    hiringManagerName,
    companyName,
    companyAddress,
    companyCityStateZip,
    jobTitle,
    previousPosition,
    previousCompany,
    skills,
    softwarePrograms,
    reasons,
  } = reqBody;
  const prompt = `Write a professional cover letter for a position of ${jobTitle} at ${companyName}. Highlight the following skills: ${skills}. Express enthusiasm for the role because: ${reasons}.`;
  try {
    const response = await config.openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });
    const generatedTextResponse = response.choices[0].text.trim();
    // logger.info("Generated cover letter:", generatedTextResponse);
    const placeholders = {
      "[Your Name]": yourName,
      "[Address]": address,
      "[City, State ZIP Code]": cityStateZip,
      "[Email Address]": emailAddress,
      "[Phone Number]": phoneNumber,
      "[Today’s Date]": todayDate,
      "[Employer Name]": employerName,
      "[Hiring Manager Name]": hiringManagerName,
      "[Company Name]": companyName,
      "[Company Address]": companyAddress,
      "[Company City, State ZIP Code]": companyCityStateZip,
      "[Job Title]": jobTitle,
      "[Previous Position]": previousPosition,
      "[Previous Company]": previousCompany,
      "[Skills]": skills,
      "[Software Programs]": softwarePrograms,
      "[Reasons]": reasons,
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
    return {
      coverLetterHtml,
      draftContentState,
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
