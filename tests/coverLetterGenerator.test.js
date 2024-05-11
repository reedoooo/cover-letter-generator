const request = require("supertest");
const app = require("../src/app");

describe("POST /api/generate-cover-letter", () => {
  it("should generate a cover letter and return 200 status", async () => {
    const response = await request(app)
      .post("/api/generate-cover-letter")
      .send({
        url: "https://www.linkedin.com/in/john-doe/",
        jobTitle: "Software Developer",
        companyName: "Tech Corp",
        skills: "JavaScript, Node.js",
        reasons:
          "I love coding and this company's mission aligns with my values",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("coverLetter");
  });
});
