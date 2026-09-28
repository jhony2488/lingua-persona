import { withSerwist } from "@serwist/turbopack";
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

// MOBILE_EXPORT=1 → static export p/ webDir do Capacitor (api/ e serwist/
// são removidos temporariamente por scripts/build-mobile.mjs).
// Default → standalone p/ sidecar Tauri e self-host.
const isMobileExport = process.env.MOBILE_EXPORT === "1";

const nextConfig: NextConfig = {
  output: isMobileExport ? "export" : "standalone",
  ...(isMobileExport && {
    images: { unoptimized: true },
    // api/ e serwist/ são stashed durante o export mobile; os testes
    // referenciam essas rotas e quebrariam o typecheck do build.
    // Typecheck completo segue rodando no build normal e no CI.
    typescript: { ignoreBuildErrors: true },
  }),
  transpilePackages,
};

export default withSerwist(nextConfig);
