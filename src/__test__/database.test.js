jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

const mongoose = require("mongoose");
const { connectDB } = require("../config/database");
const logger = require("../config/winston");

jest.mock("../config/winston", () => ({
	info: jest.fn(),
	error: jest.fn(),
}));
describe("Database Connection", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should connect to the database successfully", async () => {
    mongoose.connect.mockResolvedValue("Connected");
    await connectDB();
    expect(mongoose.connect).toHaveBeenCalledWith(expect.any(String));
    expect(logger.info).toHaveBeenCalledWith("MongoDB connected successfully");
  });

  // In your test
  it("should handle database connection errors", async () => {
    mongoose.connect.mockRejectedValue(new Error("Connection failed"));
    await expect(connectDB()).rejects.toThrow("Connection failed");
    expect(logger.error).toHaveBeenCalledWith(
      "MongoDB connection failed: Connection failed"
    );
  });
});
