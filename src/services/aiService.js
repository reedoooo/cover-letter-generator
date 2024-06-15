const logger = require('../config/winston');
const User = require('../models/User');
const { scrapeLinkedInJobListing } = require('../utils/dataUtilities');
const { createCoverLetterHtml, createDraftContentState } = require('../utils/fileConversionUtilities');
const {
  replacePlaceholders,
  convertDraftContentStateToPlainText,
  replaceUnsupportedCharacters,
} = require('../utils/genUtilities');
const { createPrompt, fetchOpenAIResponse } = require('../utils/openAiUtilities');
const { generatePDF, savePDF } = require('../utils/pdfUtilities');

exports.generateCoverLetter = async (formValues, pdfFile, pdfText, pdfUrl, linkedInUrl) => {
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
      logger.error(`Error scraping LinkedIn job listing: ${error.message}`, error);
    }
  }

  const finalJobTitle = jobData.jobTitle || 'the position';
  const finalCompanyName = jobData.companyName || 'the company';
  const finalJobDescription = jobData.jobDescription || 'Not provided';
  const finalJobRequirements = jobData.jobRequirements || 'Not provided';
  const finalSkills = skills || jobData.skills || 'Not provided';
  const finalQualifications = jobData.qualifications || 'Not provided';
  const finalCompanyCulture = jobData.companyCulture || 'Not provided';
  const finalBenefits = jobData.benefits || 'Not provided';

  const prompt = createPrompt({
    generatorTitle: 'coverLetter',
    data: {
      finalJobTitle,
      finalCompanyName,
      finalJobDescription,
      finalJobRequirements,
      finalQualifications,
      finalCompanyCulture,
      finalBenefits,
      finalSkills,
      pdfText,
    },
  });

  try {
    let generatedTextResponse = await fetchOpenAIResponse(prompt);
    generatedTextResponse = replaceUnsupportedCharacters(generatedTextResponse);

    const placeholders = {
      '[Your Name]': yourName || 'Not provided',
      '[Your Address]': yourAddress || 'Not provided',
      '[City, State, Zip Code]': cityStateZip || 'Not provided',
      '[Email Address]': emailAddress || 'Not provided',
      '[Phone Number]': phoneNumber || 'Not provided',
      '[Date]': new Date().toLocaleDateString(),
      'Hiring Manager': employerName,
      'the company': finalCompanyName,
      '[Company Address]': companyAddress || 'Not provided',
      '[Company City, State, Zip Code]': companyCityStateZip || 'Not provided',
    };

    const generatedText = replacePlaceholders(generatedTextResponse, placeholders);
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
exports.generateChatResponse = async message => {
  const prompt = createPrompt({
    generatorTitle: 'chatResponse',
    data: {
      message,
    },
  });

  try {
    let generatedTextResponse = await fetchOpenAIResponse(prompt);
    generatedTextResponse = replaceUnsupportedCharacters(generatedTextResponse);
    return generatedTextResponse;
  } catch (error) {
    logger.error(`Error generating chat response: ${error.message}`, error);
    throw error;
  }
};
exports.saveDraftToDatabase = async (content, contentName, userId) => {
  try {
    const plainText = convertDraftContentStateToPlainText(content);
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
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
exports.reviseComponent = async (prompt, code) => {
  const completion = await openai.chat.completions.create({
    model: openaiGpt4Model,
    messages: [
      {
        role: "system",
        content: systemPrompts.reviseComponent({ prompt, code })
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2000,
    n: 1,
  });

  const choices = completion.choices;

  if (!choices || choices.length === 0 || !choices[0] || !choices[0].message || !choices[0].message.content) {
    throw new Error("No choices returned from OpenAI");
  }

  const diff = choices[0].message.content;

  if (!containsDiff(diff)) {
    throw new Error("No diff found in message");
  }

  const newCode = applyDiff(code, diff);

  return newCode;
}
exports.generateNewComponent = async (prompt) =>  {
  const completion = await openai.chat.completions.create({
    model: openaiGpt4Model,
    messages: [
      {
        role: "system",
        content: systemPrompts.generateNewComponent({ prompt })
      },
      {
        role: "user",
        content: [
          `- Component Name: Section`,
          `- Component Description: ${prompt}\n`,
          `- Do not use libraries or imports other than React.`,
          `- Do not have any dynamic data. Use placeholders as data. Do not use props.`,
          `- Write only a single component.`,
        ].join("\n"),
      },
    ],
    temperature: 0,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2000,
    n: 1,
  });

  const choices = completion.choices;

  if (!choices || choices.length === 0 || !choices[0] || !choices[0].message) {
    throw new Error("No choices returned from OpenAI");
  }

  let result = choices[0].message.content || "";
  result = extractFirstCodeBlock(result);

  return result;
}
exports.reviseTemplatePrompt = async (prompt, data) => {
  const completion = await openai.chat.completions.create({
    model: openaiGpt4Model,
    messages: [
      {
        role: "system",
        content: systemPrompts.reviseTemplatePrompt({ prompt, data })
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2000,
    n: 1,
  });

  const choices = completion.choices;

  if (!choices || choices.length === 0 || !choices[0] || !choices[0].message || !choices[0].message.content) {
    throw new Error("No choices returned from OpenAI");
  }

  const diff = choices[0].message.content;

  if (!containsDiff(diff)) {
    throw new Error("No diff found in message");
  }

  const newCode = applyDiff(code, diff);

  return newCode;
}
exports.generateNewTemplate = async (prompt, data) =>  {
  const completion = await openai.chat.completions.create({
    model: openaiGpt4Model,
    messages: [
      {
        role: "system",
        content: systemPrompts.generateNewTemplate({ prompt, data })
      },
      {
        role: "user",
        content: [
          `- Template Name: Section`,
          `- Template Description: ${prompt}\n`,
        ].join("\n"),
      },
    ],
    temperature: 0,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2000,
    n: 1,
  });

  const choices = completion.choices;

  if (!choices || choices.length === 0 || !choices[0] || !choices[0].message) {
    throw new Error("No choices returned from OpenAI");
  }

  let result = choices[0].message.content || "";
  result = extractFirstCodeBlock(result);

  return result;
}