module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleNameMapper: {
    "\\.css$": "<rootDir>/styleMock.cjs",
  },
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
};
