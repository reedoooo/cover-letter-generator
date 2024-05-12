const express = require("express");
const request = require("supertest");
const { setupMiddlewares } = require("../middlewares");
const { default: mongoose } = require("mongoose");

describe("Middleware Integration Tests", () => {
  // Mock session store if necessary for tests
  jest.mock("connect-mongo", () => ({
    create: jest.fn().mockReturnValue({
      close: jest.fn(), // Mock close method if it’s available
    }),
  }));
  // Mocking mongoose.connect to throw an error
  jest.mock("mongoose", () => ({
    connect: jest.fn().mockRejectedValue(new Error("Connection failed")),
    disconnect: jest.fn(),
  }));

  let app;

  beforeEach(() => {
    app = express();
    setupMiddlewares(app);
  });

  test("should apply JSON middleware", async () => {
    app.post("/test-json", (req, res) => {
      res.send(req.body);
    });

    await request(app)
      .post("/test-json")
      .send({ message: "This is a test" })
      .expect(200, { message: "This is a test" });
  });

  test("should protect routes with rate limiting", async () => {
    const routeToTest = "/test-rate-limit";
    app.get(routeToTest, (req, res) =>
      res.status(200).json({ message: "Rate test" })
    );

    const agent = request(app);
    for (let i = 0; i < 101; i++) {
      await agent.get(routeToTest);
    }

    await agent.get(routeToTest).expect(429); // Too many requests
  });

  // After all tests
  // After all tests - Ensure to close any open connections or stores
  afterAll(async () => {
    await mongoose.disconnect();
    if (typeof someSessionStore !== "undefined" && someSessionStore.close) {
      await someSessionStore.close();
    }
    await new Promise((resolve) => setImmediate(resolve)); // This ensures that all pending async operations complete
  });
});
