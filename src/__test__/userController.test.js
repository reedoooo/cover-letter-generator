const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust path as necessary
const {
  registerUser,
  loginUser,
  logoutUser,
  validateToken,
} = require("../controllers/userController"); // Adjust path as necessary
const logger = require("../config/winston"); // Adjust path as necessary

// Mocks
jest.mock("../config/winston", () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

jest.mock("bcrypt");
jest.mock("jsonwebtoken");

// In-memory database setup
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("registerUser", () => {
  test("should register a new user successfully", async () => {
    const req = {
      body: {
        username: "newuser",
        email: "test@example.com",
        password: "password123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    bcrypt.hash.mockResolvedValue("hashedPassword");
    User.findOne = jest.fn().mockResolvedValue(null); // Assuming no user found initially
    const mockUser = {
      _id: "someGeneratedId",
      username: "newuser",
      email: "test@example.com",
      password: "hashedPassword",
      coverLetters: new Map(),
      createdAt: new Date(),
    };
    User.prototype.save = jest.fn().mockResolvedValue(mockUser);

    jwt.sign = jest.fn().mockReturnValue("fakeToken");
    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    // expect(res.json).
    // toHaveBeenCalledWith(Object.keys(mockUser));
    // Ensure that the test accurately matches the expected object structure
    // expect(res.json).toHaveBeenCalledWith({
    //   message: "User registered successfully",
    //   token: "fakeToken",
    //   userId: expect.any(String),
    //   user: expect.objectContaining({
    //     _id: expect.any(String),
    //     username: "newuser",
    //     email: "test@example.com",
    //     password: expect.any(String), // This will check type, not the actual value
    //     coverLetters: expect.any(Object),
    //     createdAt: expect.any(Date),
    //     updatedAt: expect.any(Date),
    //   }),
    // });
  });

  test("should fail if user exists", async () => {
    const req = {
      body: {
        username: "existinguser",
        email: "existing@example.com",
        password: "password123",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne = jest.fn().mockResolvedValue(true); // Simulate existing user
    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Username or email already exists",
    });
  });
});

describe("loginUser", () => {
  test("should log in a user successfully", async () => {
    const req = {
      body: {
        username: "testuser",
        password: "password",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne = jest.fn().mockResolvedValue({
      _id: "1",
      username: "testuser",
      password: "hashedPassword",
    });

    bcrypt.compare.mockResolvedValue(true); // Simulate password match
    jwt.sign = jest.fn().mockReturnValue("fakeToken");
    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: "fakeToken",
      userId: "1",
      user: expect.any(Object),
      message: "Logged in successfully",
    });
  });

  test("should fail if user not found", async () => {
    const req = {
      body: {
        username: "nonexistent",
        password: "password",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne = jest.fn().mockResolvedValue(null);
    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });
  beforeEach(() => {
    jest.resetAllMocks(); // Reset mocks to clear any previous test state
  });
  test("should fail if password does not match", async () => {
    const req = {
      body: {
        username: "testuser",
        password: "wrongpassword",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne = jest.fn().mockResolvedValue({
      _id: "1",
      username: "testuser",
      password: "hashedPassword",
    });

    // bcrypt.compare.mockResolvedValue(false); // Ensure this mock is set to return false for this test

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid username or password",
    });
  });
});

describe("logoutUser", () => {
  test("should successfully log out a user", async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await logoutUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Logged out successfully",
    });
  });
});

describe("validateToken", () => {
  test("should validate token successfully", async () => {
    const req = {
      headers: {
        authorization: "Bearer validToken",
      },
    };
    const res = {
      send: jest.fn(),
    };

    jwt.verify = jest.fn((token, secret, callback) =>
      callback(null, { userId: "1" }),
    ); // Simulate valid token
    await validateToken(req, res);

    expect(res.send).toHaveBeenCalledWith("Token is valid");
  });

  test("should return error for invalid token", async () => {
    const req = {
      headers: {
        authorization: "Bearer invalidToken",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jwt.verify = jest.fn((token, secret, callback) =>
      callback(new Error("Invalid token"), null),
    );
    await validateToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("Invalid token");
  });

  test("should return error if no token provided", async () => {
    const req = {
      headers: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    await validateToken(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith("No token provided");
  });
});
