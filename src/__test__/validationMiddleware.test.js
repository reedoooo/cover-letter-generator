const express = require("express");
const request = require("supertest");
const {
  validateCoverLetter,
  validateUserSignUp,
  validateUserLogIn,
} = require("../middlewares/validationMiddleware");
const app = express();

app.use(express.json());

// Setup routes to test the middleware
app.post("/test-cover-letter", validateCoverLetter, (req, res) => {
  res.status(200).json({ message: "Cover letter validation passed" });
});

app.post("/test-signup", validateUserSignUp, (req, res) => {
  res.status(200).json({ message: "Signup validation passed" });
});

app.post("/test-login", validateUserLogIn, (req, res) => {
  res.status(200).json({ message: "Login validation passed" });
});

module.exports = app;

describe("Validation Middleware Tests", () => {
  describe("Cover Letter Validation", () => {
    it("should reject incomplete cover letter data", async () => {
      const response = await request(app).post("/test-cover-letter").send({}); // Sending empty data to trigger validation errors
      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
    });

    it("should accept complete cover letter data", async () => {
      const validData = {
        url: "http://example.com",
        yourName: "John Doe",
        address: "123 Test St",
        cityStateZip: "Testville, TE 12345",
        emailAddress: "john@example.com",
        phoneNumber: "123-456-7890",
        todayDate: "2024-01-01",
        employerName: "Employer Inc",
        hiringManagerName: "Manager Name",
        companyName: "Company Inc",
        companyAddress: "321 Company St",
        companyCityStateZip: "Cityville, CY 54321",
        jobTitle: "Developer",
        previousPosition: "Junior Developer",
        previousCompany: "Previous Inc",
        skills: "Coding",
        softwarePrograms: "Excel",
        reasons: "Growth opportunity",
      };
      const response = await request(app)
        .post("/test-cover-letter")
        .send(validData);
      expect(response.status).toBe(200);
    });
  });

  describe("Detailed Field Validation for Signup", () => {
    const testFields = [
      { field: "username", message: "Username is required" },
      { field: "email", message: "Email is required" },
      { field: "password", message: "Password is required" },
    ];

    testFields.forEach(({ field, message }) => {
      it(`should reject signup without ${field}`, async () => {
        const userData = {
          username: "user",
          email: "user@example.com",
          password: "secure123",
        };
        delete userData[field]; // Remove the required field
        const response = await request(app).post("/test-signup").send(userData);
        expect(response.status).toBe(422);
        expect(response.body.errors).toBeDefined();
        expect(
          response.body.errors.some((error) => error.msg === message),
        ).toBeTruthy();
      });
    });
  });

  describe("User Login Middleware Validation", () => {
    it("should reject login with missing fields", async () => {
      const credentials = { username: "testuser" }; // Missing password
      const response = await request(app).post("/test-login").send(credentials);
      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
      expect(
        response.body.errors.some(
          (error) => error.msg === "Password is required",
        ),
      ).toBeTruthy();
    });

    it("should allow login with proper credentials", async () => {
      const credentials = { username: "testuser", password: "password123" };
      const response = await request(app).post("/test-login").send(credentials);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login validation passed"); // Correct the expected message
    });

    it("should reject login with empty fields", async () => {
      const credentials = { username: "", password: "" }; // Empty username and password
      const response = await request(app).post("/test-login").send(credentials);
      expect(response.status).toBe(422);
      expect(response.body.errors).toBeDefined();
      expect(
        response.body.errors.some(
          (error) => error.msg === "Username is required",
        ),
      ).toBeTruthy();
      expect(
        response.body.errors.some(
          (error) => error.msg === "Password is required",
        ),
      ).toBeTruthy();
    });
  });
});
