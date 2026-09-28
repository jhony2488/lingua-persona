import { execSync } from "node:child_process";

export default function globalSetup() {
  execSync("npx prisma db push --skip-generate --force-reset", {
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
    stdio: "inherit",
  });
}
