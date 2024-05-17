jest.mock("../config/winston", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock("../services/aiService", () => ({
  generateCoverLetter: jest.fn(),
  saveDraftToDatabase: jest.fn(),
}));

const { generate, saveDraft } = require("../controllers/coverLetterController");

const aiService = require("../services/aiService");
const httpMocks = require("node-mocks-http");

describe("generate Cover Letter", () => {
  it("should respond with generated cover letter and metadata", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      url: "/api/cover-letter/generate-cover-letter",
      body: {
        // Add any relevant body content that your generate function expects
      },
    });
    const res = httpMocks.createResponse();

    aiService.generateCoverLetter.mockResolvedValue({
      coverLetterHtml: "<p>This is a cover letter</p>",
      draftContentState: { content: "Draft content state" },
    });

    await generate(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      coverLetter: "<p>This is a cover letter</p>",
      draftContentState: { content: "Draft content state" },
      metadata: expect.objectContaining({
        generatedDate: expect.any(String),
        version: "1.0",
      }),
    });
  });

  it("should handle errors when generating cover letter", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      url: "/api/cover-letter/generate-cover-letter",
      body: {},
    });
    const res = httpMocks.createResponse();
    aiService.generateCoverLetter.mockRejectedValue(
      new Error("Failed to generate cover letter"),
    );

    await generate(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      message: "Error generating cover letter",
      error: "Failed to generate cover letter",
    });
  });
});
describe("saveDraft", () => {
  it("should save draft and respond successfully", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      url: "/api/cover-letter/save-draft",
      body: {
        content: "Some content",
        contentName: "Draft1",
        userId: "user123",
      },
    });
    const res = httpMocks.createResponse();
    const mockSavedDraft = {
      id: "draft123",
      content: "Some content",
      contentName: "Draft1",
    };

    aiService.saveDraftToDatabase.mockResolvedValue(mockSavedDraft);

    await saveDraft(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({
      message: "Draft saved successfully",
      savedDraft: mockSavedDraft,
    });
  });

  it("should handle errors when saving draft", async () => {
    const req = httpMocks.createRequest({
      method: "POST",
      url: "/api/cover-letter/save-draft",
      body: {
        content: "Draft content",
        contentName: "Draft1",
        userId: "user123",
      },
    });
    const res = httpMocks.createResponse();
    aiService.saveDraftToDatabase.mockRejectedValue(
      new Error("Failed to save draft"),
    );

    await saveDraft(req, res);
    expect(res._getJSONData()).toHaveProperty("message", "Error saving draft");

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({
      message: "Error saving draft",
      error: "Failed to save draft",
    });
  });
});
