const logger = require("../config/winston");
const User = require("../models/User");

const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const {
  convertDraftContentStateToPlainText,
  loadPdf,
  scrapeLinkedInJobListing,
} = require("../utils");
const OpenAI = require("openai");
const path = require("path");
const fs = require("fs");
function getOpenaiClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
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

  // let resumeText = "";
  // if (pdfFile) {
  //   resumeText = await loadPdf(pdfFile.path);
  // } else {
  //   resumeText = pdfText;
  // }

  // Scrape LinkedIn job listing
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

  // Handle cases where scraped data might be empty
  const finalJobTitle = jobTitle || jobData.jobTitle || "the position";
  const finalCompanyName = companyName || jobData.companyName || "the company";
  const finalJobDescription = jobData.jobDescription || "Not provided";
  const finalJobRequirements = jobData.jobRequirements || "Not provided";
  const finalSkills = skills || jobData.skills || "Not provided";

  // Prepare the prompt for OpenAI
  const prompt = `
  Write a professional cover letter for a position of ${finalJobTitle} at ${finalCompanyName}.
  Here are the details:
  - Job Title: ${finalJobTitle}
  - Company Name: ${finalCompanyName}
  - Job Description: ${finalJobDescription}
  - Responsibilities: ${finalJobRequirements}
  - Qualifications: ${jobData.qualifications || "Not provided"}
  - Company Culture: ${jobData.companyCulture || "Not provided"}
  - Benefits: ${jobData.benefits || "Not provided"}
  - Highlight the following skills: ${finalSkills}
  - Include details from the following resume: ${pdfText || "Not provided"}
  `;

  logger.info(`Generated prompt: ${prompt}`);

  const openaiClient = getOpenaiClient();

  try {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });

    const generatedTextResponse = response.choices[0].message.content.trim();

    logger.info(
      `[GENERATED COVER LATER FROM RESPONSE] ${generatedTextResponse}`
    );

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

    const coverLetterHtml = `
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          .container {
            width: 80%;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 10px;
            background-color: #f9f9f9;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .headerTitle {
            font-size: 1.2em;
            margin: 5px 0;
          }
          .resumeTitle {
            font-weight: bold;
          }
          .resumeImage {
            width: 150px;
            height: 150px;
            border-radius: 50%;
          }
          .resumeBody {
            margin-top: 20px;
          }
          .resumeBodyTitle {
            font-size: 1.4em;
            margin-bottom: 10px;
          }
          .resumeBodyContent {
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <div>
              <h1>${yourName}</h1>
              <p class="resumeTitle headerTitle">${jobTitle}</p>
              <p class="resumeTitle">${companyName}</p>
            </div>
          </header>
          <div class="resumeBody">
            <div>
              <h2 class="resumeBodyTitle">PROFILE SUMMARY</h2>
              <p class="resumeBodyContent">${pdfText}</p>
            </div>
            <div>
              <h2 class="resumeBodyTitle">JOB DESCRIPTION</h2>
              <p class="resumeBodyContent">${finalJobDescription}</p>
            </div>
            <div>
              <h2 class="resumeBodyTitle">RESPONSIBILITIES</h2>
              <p class="resumeBodyContent">${finalJobRequirements}</p>
            </div>
            <div>
              <h2 class="resumeBodyTitle">QUALIFICATIONS</h2>
              <p class="resumeBodyContent">${jobData.qualifications || "Not provided"}</p>
            </div>
            <div>
              <h2 class="resumeBodyTitle">SKILLS</h2>
              <p class="resumeBodyContent">${finalSkills}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const draftContentState = {
      entityMap: {},
      blocks: [
        {
          key: "1",
          text: yourName,
          type: "header-one",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {},
        },
        {
          key: "2",
          text: jobTitle,
          type: "header-two",
          depth: 0,
          inlineStyleRanges: [
            { offset: 0, length: jobTitle.length, style: "BOLD" },
          ],
          entityRanges: [],
          data: {},
        },
        {
          key: "3",
          text: companyName,
          type: "header-two",
          depth: 0,
          inlineStyleRanges: [
            { offset: 0, length: companyName.length, style: "BOLD" },
          ],
          entityRanges: [],
          data: {},
        },
        {
          key: "4",
          text: "PROFILE SUMMARY",
          type: "header-two",
          depth: 0,
          inlineStyleRanges: [
            { offset: 0, length: "PROFILE SUMMARY".length, style: "BOLD" },
          ],
          entityRanges: [],
          data: {},
        },
        {
          key: "5",
          text: pdfText,
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {},
        },
        {
          key: "6",
          text: "JOB DESCRIPTION",
          type: "header-two",
          depth: 0,
          inlineStyleRanges: [
            { offset: 0, length: "JOB DESCRIPTION".length, style: "BOLD" },
          ],
          entityRanges: [],
          data: {},
        },
        {
          key: "7",
          text: finalJobDescription,
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {},
        },
        {
          key: "8",
          text: "RESPONSIBILITIES",
          type: "header-two",
          depth: 0,
          inlineStyleRanges: [
            { offset: 0, length: "RESPONSIBILITIES".length, style: "BOLD" },
          ],
          entityRanges: [],
          data: {},
        },
        {
          key: "9",
          text: finalJobRequirements,
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {},
        },
        {
          key: "10",
          text: "QUALIFICATIONS",
          type: "header-two",
          depth: 0,
          inlineStyleRanges: [
            { offset: 0, length: "QUALIFICATIONS".length, style: "BOLD" },
          ],
          entityRanges: [],
          data: {},
        },
        {
          key: "11",
          text: jobData.qualifications || "Not provided",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {},
        },
        {
          key: "12",
          text: "SKILLS",
          type: "header-two",
          depth: 0,
          inlineStyleRanges: [
            { offset: 0, length: "SKILLS".length, style: "BOLD" },
          ],
          entityRanges: [],
          data: {},
        },
        {
          key: "13",
          text: finalSkills,
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {},
        },
      ],
    };

    // Create and save the PDF
    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const page = pdfDoc.addPage([595.28, 841.89]);

    const { width, height } = page.getSize();
    const fontSize = 10;
    const margin = 50;
    let y = height - margin;
    const words = res?.data?.choices[0]?.text.split(" ");
    const lines = [];
    let line = "";

    for (const word of words) {
      if ((line + word).length > 100) {
        lines.push(line);
        line = "";
      }

      line += `${word} `;
    }

    if (line.length > 0) {
      lines.push(line);
    }

    page.drawText(lines.join("\n"), {
      x: 50,
      y: height - 4 * fontSize,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0.53, 0.71),
    });
    const pdfBytes = await pdfDoc.save();
    // saveAs(new Blob([pdfBytes.buffer]), "My_cover_letter.pdf");
    const pdfDir = path.join(__dirname, "../generated");
    const pdfPath = path.join(pdfDir, "cover_letter.pdf");
    // const pdfPath = path.join(__dirname, "../generated/cover_letter.pdf");
    // Ensure the directory exists
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }

    fs.writeFileSync(pdfPath, pdfBytes);
    return {
      rawTextResponse: response.choices[0].message.content, // PropType: string (plain text)
      coverLetterHtml, // PropType: string (HTML)
      draftContentState, // PropType: object (Draft.js content state)
      pdfBytes,
      pdfPath,
    };
  } catch (error) {
    logger.error(`Error generating cover letter: ${error.message}`, error);
    throw error;
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
