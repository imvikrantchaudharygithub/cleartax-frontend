#!/usr/bin/env bash
# Runs unit tests for dependency-free TS modules without adding a test framework:
# compile tests/*.test.ts (and whatever they import) to .test-out/ with tsc, then
# run Node's built-in test runner. Pure modules must use relative imports only.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf .test-out
npx tsc --outDir .test-out --rootDir . --module commonjs --target es2020 \
  --strict --esModuleInterop --skipLibCheck --types node tests/*.test.ts
node --test .test-out/tests/*.test.js
