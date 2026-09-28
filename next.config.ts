import type { NextConfig } from "next";

// Pacotes com código ESM/TS em node_modules que precisam passar pelo
// transform SWC do Jest (next/jest usa esta lista para o transformIgnorePatterns).
const transpilePackages = [
  "msw",
  "@mswjs/interceptors",
  "@open-draft/deferred-promise",
  "@open-draft/logger",
  "@open-draft/until",
  "until-async",
  "strict-event-emitter",
  "is-node-process",
  "outvariant",
  "headers-polyfill",
  "type-fest",
  "rettime",
  "statuses",
  "cookie",
  "tough-cookie",
  "path-to-regexp",
  "graphql",
];

const nextConfig: NextConfig = {
  transpilePackages,
};

export default nextConfig;
