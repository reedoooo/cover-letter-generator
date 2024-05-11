const cheerio = require("cheerio");
function splitTextDocuments(text) {
  // Split the text into individual documents based on some delimiter or criteria
  // For example, splitting by empty lines assuming each document is separated by empty lines
  const documents = text.split(/\n\s*\n/);

  // Remove any leading or trailing whitespace from each document
  const cleanedDocuments = documents.map((doc) => doc.trim());

  return cleanedDocuments;
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
    console.error("Error extracting text from URL:", error);
    throw error;
  }
}

module.exports = {
  splitTextDocuments,
  extractTextFromUrl,
};
