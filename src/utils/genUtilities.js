const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../config/winston');
// --- UTILITIES MAP ---
//    |
//    |- replaceUnsupportedCharacters: this function is used to replace unsupported characters in the text
//    |- replacePlaceholders: this function is used to replace placeholders in the text
//    |- extractTextFromUrl: this function is used to extract text from a URL
//    |- splitTextDocuments: this function is used to split text into individual documents
//    |- convertDraftContentStateToPlainText: this function is used to convert draft content state to plain text
//    |- convertToRegularObject: this function is used to convert an array to a regular object
//    |- escapeRegExp: this function is used to escape regular expression characters
//    |- extractFirstCodeBlock: this function is used to extract the first code block from the input
//    |- containsDiff: this function is used to check if the message contains a diff
//    |- applyDiff: this function is used to apply a diff to the code
//    |
// ---
function replaceUnsupportedCharacters(text) {
  const replacements = {
    '●': '*',
  };
  return text.replace(/[\u2022]/g, char => replacements[char] || char);
}
function replacePlaceholders(text, placeholders) {
  return text.replace(/\[.*?\]/g, match => placeholders[match] || match);
}
async function extractTextFromUrl(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const text = [];
    $('div.description__text').each((index, element) => {
      text.push($(element).text().trim());
    });

    const lines = text.map(line => line.trim()).filter(line => line);
    const document = splitTextDocuments(lines.join('\n'));
    return document;
  } catch (error) {
    logger.error('Error extracting text from URL:', error);
    throw error;
  }
}
function splitTextDocuments(text) {
  // Split the text into individual documents based on some delimiter or criteria
  // For example, splitting by empty lines assuming each document is separated by empty lines
  const documents = text.split(/\n\s*\n/);

  // Remove any leading or trailing whitespace from each document
  const cleanedDocuments = documents.map(doc => doc.trim());

  return cleanedDocuments;
}
function convertDraftContentStateToPlainText(draftContentState) {
  if (!draftContentState.blocks) {
    logger.error('Invalid draft content state: Missing blocks');
    return ''; // Return empty string if no blocks are found
  }
  const plainText = draftContentState.blocks.map(block => block.text).join('\n');

  return plainText;
}
const convertToRegularObject = inputArray => {
  if (!Array.isArray(inputArray)) {
    throw new TypeError(`EXPECTED INPUT TO BE AN ARRAY, GOT ${typeof inputArray} of ${inputArray}`);
  }
  return inputArray.reduce((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});
};
const escapeRegExp = str => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};
const extractFirstCodeBlock = input => {
  const pattern = /```(\w+)?\n([\s\S]+?)\n```/g;
  let matches;
  while ((matches = pattern.exec(input)) !== null) {
    const language = matches[1];
    const codeBlock = matches[2];
    if (language === undefined || language === 'tsx' || language === 'json') {
      return codeBlock;
    }
  }

  // console.log(input);
  throw new Error('No code block found in input');
};
const containsDiff = message => {
  return message.includes('<<<<<<< ORIGINAL') && message.includes('>>>>>>> UPDATED') && message.includes('=======\n');
};
const applyDiff = (code, diff) => {
  const regex = /<<<<<<< ORIGINAL\n(.*?)=======\n(.*?)>>>>>>> UPDATED/gs;

  let match;

  // debugger;
  while ((match = regex.exec(diff)) !== null) {
    const [, before, after] = match;

    // Convert match to a regex. We need to do this because
    // gpt returns the code with the tabs removed. The idea here is to
    // convert newlines to \s+ so that we catch even if the indentation
    // is different.
    // TODO: Before we replace, we can also check how indented the code is
    // and add the same indentation to the replacement.
    let regex = escapeRegExp(before);
    regex = regex.replaceAll(/\r?\n/g, '\\s+');
    regex = regex.replaceAll(/\t/g, '');

    // Create the regex
    const replaceRegex = new RegExp(regex);

    // console.log(`Replacing $$$${replaceRegex}$$$ with $$$${after}$$$`);
    // console.log(`Code before: ${code}`);

    code = code.replace(replaceRegex, after);
  }

  return code;
};
module.exports = {
  splitTextDocuments,
  extractTextFromUrl,
  convertDraftContentStateToPlainText,
  convertToRegularObject,
  replacePlaceholders,
  replaceUnsupportedCharacters,
  escapeRegExp,
};
