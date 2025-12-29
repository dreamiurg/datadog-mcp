#!/usr/bin/env node

/**
 * Context-aware prepare script for npm lifecycle.
 *
 * This script handles different installation scenarios:
 * - CI environment: Skips (explicit build step in workflow)
 * - Local development: Builds TypeScript and sets up Husky (shows errors)
 * - Install from GitHub: Builds TypeScript (devDeps available)
 * - Install from npm: Skips build silently (devDeps not available)
 */

const { execSync } = require("child_process");
const fs = require("fs");

// Skip in CI environments - builds are handled explicitly in workflows
if (process.env.CI) {
  process.exit(0);
}

// Check if TypeScript is available (indicates dev environment or git install)
function isTypeScriptAvailable() {
  try {
    require.resolve("typescript");
    return true;
  } catch {
    return false;
  }
}

// Build TypeScript if available
if (isTypeScriptAvailable()) {
  console.log("Building TypeScript...");
  try {
    execSync("npm run build", { stdio: "inherit" });
  } catch (error) {
    console.error("Build failed:", error.message);
    process.exit(1);
  }
}

// Run Husky only if .git directory exists (local development)
if (fs.existsSync(".git")) {
  try {
    execSync("husky", { stdio: "inherit" });
  } catch {
    // Husky might not be available or might fail, that's okay
  }
}
