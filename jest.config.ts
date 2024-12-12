import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  rootDir: "./",
  testMatch: ["**/tests/**/*.test.ts", "**/tests/**/*.test.tsx"],
  maxWorkers: 4,
};

export default config;
