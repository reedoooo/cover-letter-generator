const { scrapeLinkedInJobListing } = require("./dataUtilities.js");
const { createPrompt, fetchOpenAIResponse } = require("./openAiUtilities");
const {
  splitTextDocuments,
  extractTextFromUrl,
  convertDraftContentStateToPlainText,
  replacePlaceholders,
} = require("./genUtilities");
const {
  createCoverLetterHtml,
  createDraftContentState,
} = require("./fileConversionUtilities");
const { generatePDF, savePDF, loadPDF } = require("./pdfUtilities");

module.exports = {
  scrapeLinkedInJobListing,
  createPrompt,
  fetchOpenAIResponse,
  splitTextDocuments,
  extractTextFromUrl,
  convertDraftContentStateToPlainText,
  scrapeLinkedInJobListing,
  replacePlaceholders,
  createCoverLetterHtml,
  createDraftContentState,
  generatePDF,
  savePDF,
  loadPDF,
};
