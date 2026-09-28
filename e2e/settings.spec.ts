// e2e/features/settings.feature
import { test, expect, urls, seedProfile } from "./fixtures";

test.describe("Settings", () => {
  test.beforeEach(async ({ page, userId }) => {
    await seedProfile(page, userId);
  });

  test("persists teacher name and gender across reloads", async ({ page }) => {
    await page.goto(urls.settings);

    await page.getByLabel("Teacher name").fill("Maya");
    // Select (Base UI): abre o trigger e escolhe a option
    await page.locator("label").filter({ hasText: "Teacher voice" }).getByRole("combobox").click();
    await page.getByRole("option", { name: /Female/ }).click();

    await page.reload();
    await expect(page.getByLabel("Teacher name")).toHaveValue("Maya");
    await expect(
      page.locator("label").filter({ hasText: "Teacher voice" }).getByRole("combobox"),
    ).toContainText(/Female/);
  });

  test("persists level and dialect across reloads", async ({ page }) => {
    await page.goto(urls.settings);

    await page.locator("label").filter({ hasText: "Dialect" }).getByRole("combobox").click();
    await page.getByRole("option", { name: "British English" }).click();

    await page.locator("label").filter({ hasText: "Your level" }).getByRole("combobox").click();
    await page.getByRole("option", { name: "B2", exact: true }).click();

    await page.reload();
    await expect(
      page.locator("label").filter({ hasText: "Dialect" }).getByRole("combobox"),
    ).toContainText("British English");
    await expect(
      page.locator("label").filter({ hasText: "Your level" }).getByRole("combobox"),
    ).toContainText("B2");
  });
});
