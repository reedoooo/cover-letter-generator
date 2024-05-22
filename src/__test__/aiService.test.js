const User = require("../models/User");
const config = require("../config/index");
const logger = require("../config/winston");
const { convertDraftContentStateToPlainText } = require("../utils");
const {
  generateCoverLetter,
  saveDraftToDatabase,
} = require("../services/aiService");

jest.mock("../models/User");
jest.mock("../config/index");
jest.mock("../config/winston");
jest.mock("../utils");

describe("Cover Letter Helpers", () => {
  beforeEach(() => {
    logger.error.mockClear();
    User.findById.mockClear();
    config.openai.completions.create.mockClear();
    convertDraftContentStateToPlainText.mockClear();
  });
  describe("generateCoverLetter", () => {
    it("should generate a cover letter successfully", async () => {
      const fakeResponse = {
        choices: [{ text: "Generated cover letter content" }],
      };
      config.openai.completions.create.mockResolvedValue(fakeResponse);

      const reqBody = {
        url: "http://example.com",
        yourName: "John Doe",
        address: "123 Street",
        cityStateZip: "City, ST 12345",
        emailAddress: "john@example.com",
        phoneNumber: "1234567890",
        todayDate: "2022-01-01",
        employerName: "Example Corp",
        hiringManagerName: "Jane Smith",
        companyName: "Example Corp",
        companyAddress: "123 Business Rd.",
        companyCityStateZip: "City, ST 12345",
        jobTitle: "Software Engineer",
        previousPosition: "Junior Engineer",
        previousCompany: "Tech Co",
        skills: "coding, debugging",
        softwarePrograms: "Excel, Word",
        reasons: "growth and learning opportunities",
      };

      const result = await generateCoverLetter(reqBody);
      expect(result.coverLetterHtml).toContain(
        "Generated cover letter content",
      );
      expect(config.openai.completions.create).toHaveBeenCalledTimes(1);
    });

    it("should handle errors during cover letter generation", async () => {
      config.openai.completions.create.mockRejectedValue(
        new Error("API Error"),
      );
      await expect(generateCoverLetter({})).rejects.toThrow("API Error");
      expect(logger.error).toHaveBeenCalled();
    });
  });
  describe("saveDraftToDatabase", () => {
    it("should save a draft successfully", async () => {
      const userId = "123";
      const content = { entityMap: {}, blocks: [] };
      const contentName = "Draft1";
      const user = {
        coverLetters: new Map(),
        save: jest.fn(),
      };

      User.findById.mockResolvedValue(user);
      convertDraftContentStateToPlainText.mockReturnValue("Plain text content");

      const result = await saveDraftToDatabase(content, contentName, userId);
      expect(result.content).toBe("Plain text content");
      expect(user.save).toHaveBeenCalled();
    });

    it("should handle errors when user not found", async () => {
      User.findById.mockResolvedValue(null);
      await expect(saveDraftToDatabase({}, "Draft1", "123")).rejects.toThrow(
        "User not found",
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it("should handle database errors during draft saving", async () => {
      const error = new Error("Database error");
      User.findById.mockRejectedValue(error);

      await expect(saveDraftToDatabase({}, "Draft1", "123")).rejects.toThrow(
        "Database error",
      );
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
