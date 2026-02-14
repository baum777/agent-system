/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/test/**/*.spec.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFiles: ["<rootDir>/test/_utils/jest.setup.ts"],
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.jest.json",
      },
    ],
  },
  moduleNameMapper: {
    "^@shared/(.*)$": "<rootDir>/../../packages/shared/src/$1",
    "^@agent-runtime/(.*)$": "<rootDir>/../../packages/agent-runtime/src/$1",
    "^@governance/(.*)$": "<rootDir>/../../packages/governance/src/$1",

    "^@agent-system/shared$": "<rootDir>/../../packages/shared/src/index.ts",
    "^@agent-system/agent-runtime$": "<rootDir>/../../packages/agent-runtime/src/index.ts",
    "^@agent-system/workflow$": "<rootDir>/../../packages/workflow/src/index.ts",
    "^@agent-system/knowledge$": "<rootDir>/../../packages/knowledge/src/index.ts",
    "^@agent-system/governance$": "<rootDir>/../../packages/governance/src/index.ts",
  },
};

