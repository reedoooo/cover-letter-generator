const request = require("supertest");
const express = require("express");
const { errorHandler } = require("../middlewares/errorHandler");
const logger = require("../config/winston");

jest.mock("../config/winston", () => ({
  error: jest.fn(),
}));

describe("Error Handler Tests", () => {
  let app;

  beforeEach(() => {
    app = express(); // Create a new Express application for each test to avoid state leakage
    app.use((req, res, next) => {
      // Simulate an error being thrown in a middleware before the error handler
      const error = new Error("Simulated error");
      error.status = 500;
      throw error;
    });
    app.use(errorHandler); // Apply the error handler
  });

  test("should return 500 status code for server errors", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Server Error",
      error: "Simulated error",
    });
    expect(logger.error).toHaveBeenCalledWith(`Error: Simulated error`);
  });

  test("should log the error", async () => {
    await request(app).get("/");
    // Verify that logger.error was called with the correct message
    expect(logger.error).toHaveBeenCalledWith("Error: Simulated error");
  });
});
