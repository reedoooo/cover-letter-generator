// jest.config.js
module.exports = {
  setupFiles: ["<rootDir>/src/setupTests.js"],
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "src"],
  testPathIgnorePatterns: [
    "<rootDir>/src/config/env/",
    "<rootDir>/src/__tests__/coverLetterController.test.js", // Ignore coverLetterController tests
    "<rootDir>/src/__tests__/userController.test.js", // Ignore userController tests
  ],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
};
