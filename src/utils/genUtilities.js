const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const { Builder, By, until } = require("selenium-webdriver");

const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("../config/winston");

function replaceUnsupportedCharacters(text) {
  const replacements = {
    "●": "*",
  };
  return text.replace(/[\u2022]/g, (char) => replacements[char] || char);
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
	replaceUnsupportedCharacters,
};
