// e2e/features/pwa.feature
import { test, expect, urls } from "./fixtures";

test.describe("PWA", () => {
  test("manifest is served", async ({ page }) => {
    const res = await page.request.get("/manifest.webmanifest");
    expect(res.status()).toBe(200);
    const manifest = await res.json();
    expect(manifest.name).toContain("LinguaPersona");
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  test("offline page renders", async ({ page }) => {
    await page.goto(urls.offline);
    await expect(page.getByText(/offline/i).first()).toBeVisible();
  });

  test.skip("install banner on beforeinstallprompt", async () => {
    // beforeinstallprompt não é disparável em headless — cenário manual
  });
});
