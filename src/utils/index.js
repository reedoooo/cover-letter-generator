const { scrapeLinkedInJobListing } = require("./dataUtilities.js");
const { createPrompt, fetchOpenAIResponse } = require("./openAiUtilities");
const {
  splitTextDocuments,
  extractTextFromUrl,
  convertDraftContentStateToPlainText,
  getCoverLetter,
  loadPdf,
  scrapeLinkedInJobListing,
  replacePlaceholders,
} = require("./genUtilities");
const {
  createCoverLetterHtml,
  createDraftContentState,
} = require("./fileConversionUtilities");
const { generatePDF, savePDF, loadPdf } = require("./pdfUtilities");

module.exports = {
  scrapeLinkedInJobListing,
  createPrompt,
  fetchOpenAIResponse,
  splitTextDocuments,
  extractTextFromUrl,
  convertDraftContentStateToPlainText,
  getCoverLetter,
  loadPdf,
  scrapeLinkedInJobListing,
  replacePlaceholders,
  createCoverLetterHtml,
  createDraftContentState,
  generatePDF,
  savePDF,
  loadPdf,
};
