const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const { Builder, By, until } = require("selenium-webdriver");

const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("../config/winston");

const scrapeLinkedInJobListing = async (url) => {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    // Navigate to the LinkedIn job listing page
    await driver.get(url);
    await driver.wait(
      until.elementLocated(By.css(".top-card-layout__title")),
      10000
    );

    // Get the page source
    const pageSource = await driver.getPageSource();
    const $ = cheerio.load(pageSource);

    // Utility function to clean text
    const cleanText = (text) =>
      text.replace(/\n/g, " ").replace(/\s\s+/g, " ").trim();

    // Extract job-related data
    const jobTitle = cleanText($(".top-card-layout__title").text());
    const companyName = cleanText(
      $(".topcard__org-name-link, .topcard__flavor--black-link").text()
    );
    const jobDescription = cleanText($(".description__text").text());
    const jobRequirements = cleanText(
      $(".description__job-criteria-text")
        .map((i, el) => $(el).text().trim())
        .get()
        .join(", ")
    );
    const skills = cleanText(
      $(".job-criteria__item")
        .filter(
          (i, el) =>
            $(el).find(".job-criteria__subheader").text().trim() === "Skills"
        )
        .find(".job-criteria__text")
        .text()
        .trim()
        .split(",")
        .map((skill) => skill.trim())
        .join(", ")
    );

    // Extract additional useful data
    const location = cleanText($(".topcard__flavor--bullet").first().text());
    const employmentType = cleanText(
      $(".job-criteria__item")
        .filter(
          (i, el) =>
            $(el).find(".job-criteria__subheader").text().trim() ===
            "Employment type"
        )
        .find(".job-criteria__text")
        .text()
        .trim()
    );
    const postedDate = cleanText($(".posted-time-ago__text").text());
    const seniorityLevel = cleanText(
      $(".job-criteria__item")
        .filter(
          (i, el) =>
            $(el).find(".job-criteria__subheader").text().trim() ===
            "Seniority level"
        )
        .find(".job-criteria__text")
        .text()
        .trim()
    );
    const industries = cleanText(
      $(".job-criteria__item")
        .filter(
          (i, el) =>
            $(el).find(".job-criteria__subheader").text().trim() ===
            "Industries"
        )
        .find(".job-criteria__text")
        .text()
        .trim()
    );

    // Extract company culture and benefits
    const companyCulture = cleanText($(".company-culture__text").text());
    const benefits = cleanText($(".benefits__text").text());

    // Construct result object
    const jobData = {
      jobTitle: jobTitle,
      companyName: companyName,
      jobDescription: jobDescription,
      jobRequirements: jobRequirements,
      skills: skills,
      location: location,
      employmentType: employmentType,
      postedDate: postedDate,
      seniorityLevel: seniorityLevel,
      industries: industries,
      companyCulture: companyCulture,
      benefits: benefits,
    };

    // Log extracted data
    logger.info("Extracted data from LinkedIn job listing:", jobData);

    return jobData;
  } catch (error) {
    logger.error(`Error scraping LinkedIn job listing: ${error.message}`, {
      url,
      error,
    });
    throw error;
  } finally {
    await driver.quit();
  }
};
async function loadPdf(pdfPath) {
  const data = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(data);
  const pages = pdfDoc.getPages();
  let text = "";

  pages.forEach((page) => {
    text += page
      .getTextContent()
      .items.map((item) => item.str)
      .join(" ");
  });

  return text;
}
function replacePlaceholders(text, placeholders) {
  return text.replace(/\[.*?\]/g, (match) => placeholders[match] || match);
}
async function extractTextFromUrl(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const text = [];
    $("div.description__text").each((index, element) => {
      text.push($(element).text().trim());
    });

    const lines = text.map((line) => line.trim()).filter((line) => line);
    const document = splitTextDocuments(lines.join("\n"));
    return document;
  } catch (error) {
    logger.error("Error extracting text from URL:", error);
    throw error;
  }
}
function splitTextDocuments(text) {
  // Split the text into individual documents based on some delimiter or criteria
  // For example, splitting by empty lines assuming each document is separated by empty lines
  const documents = text.split(/\n\s*\n/);

  // Remove any leading or trailing whitespace from each document
  const cleanedDocuments = documents.map((doc) => doc.trim());

  return cleanedDocuments;
}
function convertDraftContentStateToPlainText(draftContentState) {
  if (!draftContentState.blocks) {
    logger.error("Invalid draft content state: Missing blocks");
    return ""; // Return empty string if no blocks are found
  }
  const plainText = draftContentState.blocks
    .map((block) => block.text)
    .join("\n");

  return plainText;
}

// async function getCoverLetter(url, pdfPath, openai_api_key) {
//   const pdfDocText = await loadPdf(pdfPath);
//   const jobPostText = await extractTextFromUrl(url);

//   const documents = splitTextDocuments(pdfDocText + jobPostText);
//   const vectordb = await Chroma.fromDocuments(
//     documents,
//     new OpenAIEmbeddings({ openai_api_key }),
//   );

//   const pdfQa = new RetrievalQA({
//     retriever: vectordb.asRetriever({ k: 6 }),
//     chainType: "stuff",
//     chatModel: new ChatOpenAI({
//       temperature: 0.7,
//       modelName: "gpt-3.5-turbo",
//       openai_api_key,
//     }),
//   });

//   const query =
//     "Write a cover letter for given CV and Job posting in a conversational style and fill out the writer's name in the end using cv";
//   const result = await pdfQa.run(query);

//   return result;
// }
const convertToRegularObject = (inputArray) => {
  if (!Array.isArray(inputArray)) {
    throw new TypeError(
      `EXPECTED INPUT TO BE AN ARRAY, GOT ${typeof inputArray} of ${inputArray}`
    );
  }
  return inputArray.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
};
module.exports = {
  splitTextDocuments,
  extractTextFromUrl,
  convertDraftContentStateToPlainText,
	convertToRegularObject,
  // getCoverLetter,
  // loadPdf,
  // scrapeLinkedInJobListing,
  replacePlaceholders,
};
