import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: "http://localhost:3000" });
  await page.addInitScript(() => {
    localStorage.setItem(
      "linguapersona-settings",
      JSON.stringify({
        state: {
          userId: "e2e-test",
          dialect: "US",
          level: "A1",
          agentName: "Alex",
          agentGender: "male",
          chatMode: "chat",
          voiceFlow: "auto",
        },
        version: 0,
      }),
    );
  });
  await page.goto("/en-US/settings");

  await page
    .locator("label")
    .filter({ hasText: "Dialect" })
    .locator('[data-slot="select-trigger"]')
    .click();
  await page
    .locator('[data-slot="select-item"]', { hasText: "British English" })
    .click();
  console.log("option clicked");
  await page.waitForTimeout(500);
  const txt = await page
    .locator("label")
    .filter({ hasText: "Dialect" })
    .locator('[data-slot="select-trigger"]')
    .textContent();
  console.log("trigger text:", txt.trim());
  await browser.close();
})().catch((e) => {
  console.error("FAIL:", e.message.split("\n").slice(0, 10).join("\n"));
  process.exit(1);
});
