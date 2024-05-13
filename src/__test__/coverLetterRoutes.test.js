const express = require("express");
const request = require("supertest");
const coverLetterRoutes = require("../routes/coverLetterRoutes"); // Adjust path as necessary

// Mock controllers and middleware
jest.mock("../controllers/coverLetterController", () => ({
  generate: (req, res) =>
    res.status(201).send({ message: "Cover letter generated" }),
  saveDraft: (req, res) => res.status(200).send({ message: "Draft saved" }),
}));

jest.mock("../middlewares/validationMiddleware", () => ({
  validateCoverLetter: (req, res, next) => next(),
}));

describe("Cover Letter Routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use("/api/cover-letter", coverLetterRoutes);
  });

  test("POST /api/cover-letter/generate-cover-letter - success", async () => {
    const response = await request(app)
      .post("/api/cover-letter/generate-cover-letter")
      .send({ userId: "1", content: "Hello" });
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ message: "Cover letter generated" });
  });

  test("POST /api/cover-letter/save-draft - success", async () => {
    const response = await request(app)
      .post("/api/cover-letter/save-draft")
      .send({ userId: "1", content: "Hello" });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "Draft saved" });
  });
});
