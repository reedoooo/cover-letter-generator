const logger = require("../config/winston");
const { splitTextDocuments } = require("../utils"); // adjust path as necessary
const { extractTextFromUrl } = require("../utils"); // adjust path as necessary
const { convertDraftContentStateToPlainText } = require("../utils"); // adjust path as necessary
const axios = require("axios");
jest.mock("axios");
jest.mock("../config/winston", () => ({
  error: jest.fn(),
}));

describe("splitTextDocuments", () => {
  it("should correctly split text into documents based on empty lines", () => {
    const text = "Document 1\n\nDocument 2\n\nDocument 3";
    const expected = ["Document 1", "Document 2", "Document 3"];
    const documents = splitTextDocuments(text);
    expect(documents).toEqual(expected);
  });

  it("should handle texts without delimiters correctly", () => {
    const text = "Single Document";
    const expected = ["Single Document"];
    const documents = splitTextDocuments(text);
    expect(documents).toEqual(expected);
  });
});
describe("extractTextFromUrl", () => {
  it("should extract and return text from the specified URL", async () => {
    const fakeHtml =
      '<div class="description__text">Text 1</div><div class="description__text">Text 2</div>';
    axios.get.mockResolvedValue({ data: fakeHtml });

    const result = await extractTextFromUrl("http://example.com");
    // Assuming result is an array containing a single string "Text 1\nText 2"
    expect(result).toEqual(["Text 1\nText 2"]); // Adjust expectation to match actual output
    expect(axios.get).toHaveBeenCalledWith("http://example.com");
  });

  it("should throw an error when the URL cannot be accessed", async () => {
    const errorMessage = "Network error";
    axios.get.mockRejectedValue(new Error(errorMessage));

    await expect(extractTextFromUrl("http://example.com")).rejects.toThrow(
      errorMessage,
    );
    expect(axios.get).toHaveBeenCalledWith("http://example.com");
  });
});

describe("convertDraftContentStateToPlainText", () => {
  it("should convert draft content state to plain text correctly", () => {
    const draftContentState = {
      blocks: [{ text: "Hello, World!" }, { text: "Testing." }],
    };
    const expected = "Hello, World!\nTesting.";
    const plainText = convertDraftContentStateToPlainText(draftContentState);
    expect(plainText).toEqual(expected);
  });

  it("should return an empty string when blocks are missing", () => {
    const draftContentState = {}; // no blocks
    const expected = "";
    const plainText = convertDraftContentStateToPlainText(draftContentState);
    expect(plainText).toEqual(expected);
  });
});
