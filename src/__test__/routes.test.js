const express = require("express");
const request = require("supertest");
const { setupRoutes } = require("../routes");
// Mock the routes to avoid dealing with their internal dependencies
jest.mock("../routes/userRoutes", () => (req, res) => res.send("User Route"));
jest.mock(
  "../routes/coverLetterRoutes",
  () => (req, res) => res.send("Cover Letter Route")
);

describe("Route Setup", () => {
  let app;

  beforeEach(() => {
    // Setup a new express app for each test
    app = express();
    setupRoutes(app); // Apply the route setup function
  });

  test("should correctly mount user routes on /api/user", async () => {
    const response = await request(app).get("/api/user");
    expect(response.text).toBe("User Route"); // Expect the mocked user route to respond
    expect(response.statusCode).toBe(200); // Expect a 200 OK response
  });

  test("should correctly mount cover letter routes on /api/cover-letter", async () => {
    const response = await request(app).get("/api/cover-letter");
    expect(response.text).toBe("Cover Letter Route"); // Expect the mocked cover letter route to respond
    expect(response.statusCode).toBe(200); // Expect a 200 OK response
  });
});
// const request = require("supertest");
// const express = require("express");
// const bodyParser = require("body-parser");
// const { body, validationResult } = require("express-validator");

// const setupRoutes = (app) => {
//   // Set up user routes
//   app.post(
//     "api/user/signup",
//     [
//       body("username").not().isEmpty().withMessage("Username is required"),
//       body("email").isEmail().withMessage("Email is required"),
//       body("password").not().isEmpty().withMessage("Password is required"),
//     ],
//     (req, res) => {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(422).json({ errors: errors.array() });
//       }
//       res.status(201).send();
//     }
//   );

//   app.post(
//     "api/user/login",
//     [
//       body("username").not().isEmpty().withMessage("Username is required"),
//       body("password").not().isEmpty().withMessage("Password is required"),
//     ],
//     (req, res) => {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(422).json({ errors: errors.array() });
//       }
//       res.status(200).send();
//     }
//   );

//   // Set up cover letter routes
//   app.post(
//     "api/cover-letter/generate-cover-letter",
//     [
//       body("url").not().isEmpty().withMessage("URL is required"),
//       body("yourName").not().isEmpty().withMessage("Your name is required"),
//       // Add further validations for each required field as defined in your middleware
//     ],
//     (req, res) => {
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(422).json({ errors: errors.array() });
//       }
//       res
//         .status(200)
//         .send({ generatedLetter: "<p>Your custom cover letter</p>" });
//     }
//   );
// };

// describe("API Validation Tests", () => {
//   let app;

//   beforeEach(() => {
//     app = express();
//     app.use(bodyParser.json()); // Make sure to use body-parser
//     setupRoutes(app);
//   });

//   describe("Cover Letter Middleware Validation", () => {
//     test("should fail without required fields", async () => {
//       const response = await request(app)
//         .post("/generate-cover-letter")
//         .send({});
//       expect(response.statusCode).toBe(422);
//       expect(response.body.errors).toEqual(
//         expect.arrayContaining([
//           { msg: "URL is required", param: "url", location: "body" },
//           { msg: "Your name is required", param: "yourName", location: "body" },
//           // Add checks for all other required fields
//         ])
//       );
//     });

//     test("should pass with all required fields", async () => {
//       const validData = {
//         url: "http://example.com",
//         yourName: "John Doe",
//         // Include all other fields as required by your endpoint
//       };

//       const response = await request(app)
//         .post("/generate-cover-letter")
//         .send(validData);
//       expect(response.statusCode).toBe(200);
//     });
//   });

//   describe("User Signup Middleware Validation", () => {
//     test("should reject incomplete signup data", async () => {
//       const response = await request(app)
//         .post("/signup")
//         .send({ username: "testuser" });
//       expect(response.statusCode).toBe(422);
//       expect(response.body.errors).toEqual(
//         expect.arrayContaining([
//           { msg: "Email is required", param: "email", location: "body" },
//           { msg: "Password is required", param: "password", location: "body" },
//         ])
//       );
//     });

//     test("should accept complete signup data", async () => {
//       const userData = {
//         username: "testuser",
//         email: "testuser@example.com",
//         password: "password123",
//       };

//       const response = await request(app).post("/signup").send(userData);
//       expect(response.statusCode).toBe(201);
//     });
//   });

//   describe("User Login Middleware Validation", () => {
//     test("should reject login with missing fields", async () => {
//       const response = await request(app)
//         .post("/login")
//         .send({ username: "testuser" });
//       expect(response.statusCode).toBe(422);
//       expect(response.body.errors).toEqual(
//         expect.arrayContaining([
//           { msg: "Password is required", param: "password", location: "body" },
//         ])
//       );
//     });

//     test("should allow login with proper credentials", async () => {
//       const credentials = { username: "testuser", password: "password123" };
//       const response = await request(app).post("/login").send(credentials);
//       expect(response.statusCode).toBe(200);
//     });
//   });
// });
