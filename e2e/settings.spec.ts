import { test, expect, urls, seedProfile } from "./fixtures";

async function storedSettings(page: import("@playwright/test").Page) {
  const raw = await page.evaluate(() =>
    localStorage.getItem("linguapersona-settings"),
  );
  return (JSON.parse(raw ?? "{}") as { state: Record<string, unknown> }).state;
}

async function selectOption(
  page: import("@playwright/test").Page,
  label: string,
  option: string | RegExp,
) {
  const trigger = page
    .locator("label")
    .filter({ hasText: label })
    .locator('[data-slot="select-trigger"]');
  for (let attempt = 0; attempt < 5; attempt++) {
    if ((await trigger.getAttribute("aria-expanded")) === "true") break;
    await trigger.click();
    await page.waitForTimeout(200);
  }
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await page
    .locator('[data-slot="select-item"]', { hasText: option })
    .click();
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
    await selectOption(page, "Teacher voice", /Female/);

    await page.reload();
    await expect(page.getByLabel("Teacher name")).toHaveValue("Maya");
    await expect(
      page
        .locator("label")
        .filter({ hasText: "Teacher voice" })
        .locator('[data-slot="select-trigger"]'),
    ).toContainText("female");

    const stored = await storedSettings(page);
    expect(stored.agentGender).toBe("female");
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
    ).toContainText("UK");
    await expect(
      page
        .locator("label")
        .filter({ hasText: "Your level" })
        .locator('[data-slot="select-trigger"]'),
    ).toContainText("B2");

    const stored = await storedSettings(page);
    expect(stored.dialect).toBe("UK");
    expect(stored.level).toBe("B2");
  });
});
