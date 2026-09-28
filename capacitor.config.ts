import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.linguapersona.app",
  appName: "LinguaPersona",
  // UI empacotada (npm run build:mobile → out/). Dados são locais
  // (@capacitor-community/sqlite) — nenhum servidor externo necessário.
  webDir: "out",
  ...(process.env.CAPACITOR_SERVER_URL && {
    server: {
      url: process.env.CAPACITOR_SERVER_URL,
      cleartext: false,
    },
  }),
};

export default config;
