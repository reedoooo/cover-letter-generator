const request = require("supertest");
const app = require("../app"); // Assume your Express app is exported from here
const aiService = require("../services/aiService");

jest.mock("../services/aiService");
describe("POST /generate", () => {
  it("should generate a cover letter successfully", async () => {
    const mockCoverLetter = {
      coverLetterHtml: "<p>Your cover letter</p>",
      draftContentState: {},
    };
    aiService.generateCoverLetter.mockResolvedValue(mockCoverLetter);

    const response = await request(app)
      .post("/generate")
      .send({ userData: "sample data" });

    expect(response.statusCode).toBe(200);
    expect(response.body.coverLetter).toBe(mockCoverLetter.coverLetterHtml);
    expect(aiService.generateCoverLetter).toHaveBeenCalledWith({
      userData: "sample data",
    });
  });

  it("should handle errors when generation fails", async () => {
    aiService.generateCoverLetter.mockRejectedValue(
      new Error("Failed to generate")
    );

    const response = await request(app)
      .post("/generate")
      .send({ userData: "sample data" });

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Error generating cover letter");
  });
});

describe("POST /saveDraft", () => {
  it("should save a draft successfully", async () => {
    aiService.saveDraftToDatabase.mockResolvedValue({
      id: "123",
      content: "Draft content",
    });

    const response = await request(app).post("/saveDraft").send({
      content: "Draft content",
      contentName: "My Draft",
      userId: "user1",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Draft saved successfully");
    expect(response.body.savedDraft).toEqual({
      id: "123",
      content: "Draft content",
    });
  });

  it("should handle errors when saving fails", async () => {
    aiService.saveDraftToDatabase.mockRejectedValue(
      new Error("Failed to save")
    );

    const response = await request(app).post("/saveDraft").send({
      content: "Draft content",
      contentName: "My Draft",
      userId: "user1",
    });

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Error saving draft");
  });
});
