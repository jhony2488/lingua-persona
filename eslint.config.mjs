import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  eslintConfigPrettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated artifacts:
    "playwright-report/**",
    "test-results/**",
    ".next-mobile-stash/**",
    ".sidecar-tmp/**",
    "src-tauri/target/**",
    "src-tauri/gen/**",
    "src-tauri/binaries/**",
    "src-tauri/resources/**",
    "data/library/*.txt",
    "standalone-*.log",
    "dev-*.log",
    "debug-*.cjs",
  ]),
]);

export default eslintConfig;
