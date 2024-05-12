// jest.config.js
module.exports = {
  setupFiles: ["<rootDir>/src/setupTests.js"],
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "src"],
  testPathIgnorePatterns: ["<rootDir>/src/config/env/"],
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
};
