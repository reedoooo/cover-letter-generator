const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("../config/winston");

const scrapeLinkedInJobListing = async (url) => {
  try {
    // Fetch the HTML content from the URL
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Extract job-related data
    const jobTitle = $("h1").text().trim();
    const companyName = $(".topcard__org-name-link").text().trim();
    const jobDescription = $(".description__text").text().trim();
    const jobRequirements = $(".description__job-criteria-list").text().trim();

    // Extract skills required for the job
    const skills = $(".job-criteria__item--skill .job-criteria__text")
      .map((i, el) => $(el).text().trim())
      .get();

    // Extract additional useful data
    const location = $(".topcard__flavor--bullet").text().trim();
    const employmentType = $(".topcard__flavor--metadata").text().trim();
    const postedDate = $(".posted-time-ago__text").text().trim();
    const seniorityLevel = $(".description__job-criteria .job-criteria__item")
      .filter(
        (i, el) =>
          $(el).find(".job-criteria__subheader").text().trim() ===
          "Seniority level"
      )
      .find(".job-criteria__text")
      .text()
      .trim();
    const industries = $(".description__job-criteria .job-criteria__item")
      .filter(
        (i, el) =>
          $(el).find(".job-criteria__subheader").text().trim() === "Industries"
      )
      .find(".job-criteria__text")
      .text()
      .trim();

    // Construct result object
    const jobData = {
      jobTitle,
      companyName,
      jobDescription,
      jobRequirements,
      skills: skills.join(", "),
      location,
      employmentType,
      postedDate,
      seniorityLevel,
      industries,
    };

    // Log extracted data
    console.log("Scraped LinkedIn Job Listing Data:");
    console.log("Job Title:", jobData.jobTitle);
    console.log("Company Name:", jobData.companyName);
    console.log("Job Description:", jobData.jobDescription);
    console.log("Job Requirements:", jobData.jobRequirements);
    console.log("Skills:", jobData.skills);
    console.log("Location:", jobData.location);
    console.log("Employment Type:", jobData.employmentType);
    console.log("Posted Date:", jobData.postedDate);
    console.log("Seniority Level:", jobData.seniorityLevel);
    console.log("Industries:", jobData.industries);

    return jobData;
  } catch (error) {
    logger.error(`Error scraping LinkedIn job listing: ${error.message}`, {
      url,
      error,
    });
    console.error(`Error scraping LinkedIn job listing: ${error.message}`);
    throw error;
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

module.exports = {
  splitTextDocuments,
  extractTextFromUrl,
  convertDraftContentStateToPlainText,
  // getCoverLetter,
  loadPdf,
  scrapeLinkedInJobListing,
};
