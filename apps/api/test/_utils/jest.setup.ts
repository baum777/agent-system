import path from "node:path";

// Some workspace packages resolve paths relative to process.cwd().
// In E2E tests we want the monorepo root as cwd.
const repoRoot = path.resolve(__dirname, "../../../..");
process.chdir(repoRoot);

