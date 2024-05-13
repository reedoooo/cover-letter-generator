const express = require("express");
const request = require("supertest");
const userRoutes = require("../routes/userRoutes"); // Adjust path as necessary

// Mock controllers and middleware
jest.mock("../controllers/userController", () => ({
  registerUser: (req, res) =>
    res.status(201).send({ message: "User registered" }),
  loginUser: (req, res) => res.status(200).send({ message: "User logged in" }),
  logoutUser: (req, res) => res.sendStatus(200),
  validateToken: (req, res) => res.sendStatus(200),
}));

jest.mock("../middlewares/validationMiddleware", () => ({
  validateUserSignUp: (req, res, next) => next(),
  validateUserLogIn: (req, res, next) => next(),
}));

describe("User Routes", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json()); // This is necessary to parse JSON request bodies
    app.use("/api/user", userRoutes);
  });

  test("POST /api/user/signup - success", async () => {
    const response = await request(app)
      .post("/api/user/signup")
      .send({ username: "test", password: "12345" });
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ message: "User registered" });
  });

  test("POST /api/user/login - success", async () => {
    const response = await request(app)
      .post("/api/user/login")
      .send({ username: "test", password: "12345" });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: "User logged in" });
  });

  test("GET /api/user/logout - success", async () => {
    const response = await request(app).get("/api/user/logout");
    expect(response.statusCode).toBe(200);
  });

  test("GET /api/user/validate-token - success", async () => {
    const response = await request(app).get("/api/user/validate-token");
    expect(response.statusCode).toBe(200);
  });
});
