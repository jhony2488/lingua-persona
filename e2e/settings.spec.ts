// e2e/features/settings.feature
import { test, expect, urls, seedProfile } from "./fixtures";

async function selectOption(
  page: import("@playwright/test").Page,
  label: string,
  option: string | RegExp,
) {
  await page
    .locator("label")
    .filter({ hasText: label })
    .locator('[data-slot="select-trigger"]')
    .click();
  await page.getByRole("option", { name: option }).click();
}

test.describe("Settings", () => {
  test.beforeEach(async ({ page, userId }) => {
    await seedProfile(page, userId);
  });

  test("persists teacher name and gender across reloads", async ({
    page,
  }) => {
    await page.goto(urls.settings);

    await page.getByLabel("Teacher name").fill("Maya");
    // Select (Base UI): trigger é button com aria-haspopup=listbox
    await selectOption(page, "Teacher voice", /Female/);

    await page.reload();
    await expect(page.getByLabel("Teacher name")).toHaveValue("Maya");
    await expect(
      page
        .locator("label")
        .filter({ hasText: "Teacher voice" })
        .locator('[data-slot="select-trigger"]'),
    ).toContainText(/Female/);
  });

  test("persists level and dialect across reloads", async ({ page }) => {
    await page.goto(urls.settings);

    await selectOption(page, "Dialect", "British English");
    await selectOption(page, "Your level", "B2");

    await page.reload();
    await expect(
      page
        .locator("label")
        .filter({ hasText: "Dialect" })
        .locator('[data-slot="select-trigger"]'),
    ).toContainText("British English");
    await expect(
      page
        .locator("label")
        .filter({ hasText: "Your level" })
        .locator('[data-slot="select-trigger"]'),
    ).toContainText("B2");
  });
});
