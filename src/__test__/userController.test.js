const request = require("supertest");
const app = require("../app"); // Your Express app
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("POST /register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user successfully", async () => {
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashedPassword");
    jwt.sign.mockReturnValue("fakeToken");

    const response = await request(app).post("/register").send({
      username: "newuser",
      email: "newuser@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      token: "fakeToken",
      userId: expect.any(String),
      user: expect.any(Object),
      message: "User registered successfully",
    });
  });

  it("should return 409 if user already exists", async () => {
    User.findOne.mockResolvedValue(true); // Simulate user exists

    const response = await request(app).post("/register").send({
      username: "existuser",
      email: "existuser@example.com",
      password: "password123",
    });

    expect(response.statusCode).toBe(409);
    expect(response.body.message).toBe("Username or email already exists");
  });
});

describe("POST /login", () => {
  it("should log in user successfully", async () => {
    User.findOne.mockResolvedValue({
      _id: "123",
      username: "testuser",
      password: "hashedPassword",
    });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fakeToken");

    const response = await request(app)
      .post("/login")
      .send({ username: "testuser", password: "password" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      token: "fakeToken",
      userId: "123",
      user: expect.any(Object),
      message: "Logged in successfully",
    });
  });

  it("should return 401 if password does not match", async () => {
    User.findOne.mockResolvedValue({
      username: "testuser",
      password: "hashedPassword",
    });
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post("/login")
      .send({ username: "testuser", password: "wrongPassword" });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Invalid username or password");
  });
});

describe("POST /logout", () => {
  it("should log out the user successfully", async () => {
    const response = await request(app).post("/logout");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Logged out successfully");
  });
});

describe("GET /validateToken", () => {
  it("should validate token successfully", async () => {
    jwt.verify.mockImplementation((token, secret, callback) =>
      callback(null, { userId: "123" })
    );

    const response = await request(app)
      .get("/validateToken")
      .set("Authorization", "Bearer fakeToken");

    expect(response.statusCode).toBe(200);
    expect(response.text).toBe("Token is valid");
  });

  it("should return 401 for invalid token", async () => {
    jwt.verify.mockImplementation((token, secret, callback) =>
      callback(new Error("Invalid token"), null)
    );

    const response = await request(app)
      .get("/validateToken")
      .set("Authorization", "Bearer fakeToken");

    expect(response.statusCode).toBe(401);
    expect(response.text).toBe("Invalid token");
  });
});
