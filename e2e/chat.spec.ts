import { test, expect, urls, seedProfile, goto } from "./fixtures";

test.describe("Chat", () => {
  test.beforeEach(async ({ page, userId }) => {
    await seedProfile(page, userId);
  });

  test("creates a new empty conversation", async ({ page }) => {
    await goto(page, urls.chat);
    await page.getByRole("button", { name: "New conversation" }).click();

    await expect(page.getByRole("button", { name: /Practice/ })).toBeVisible();
    await expect(
      page.getByPlaceholder("Type or dictate a message…"),
    ).toBeVisible();
  });

  test("sends message and receives assistant reply", async ({ page }) => {
    await goto(page, urls.chat);
    await page.getByRole("button", { name: "New conversation" }).click();

    await page
      .getByPlaceholder("Type or dictate a message…")
      .fill("Hello, teacher!");
    await page.getByRole("button", { name: "Send message" }).click();

    const messages = page.locator("main").getByText("Hello, teacher!");
    await expect(messages.first()).toBeVisible();
    await expect(page.getByText(/placeholder/i).first()).toBeVisible({
      timeout: 15000,
    });
  });

  test("starts conversation from suggested topic", async ({ page }) => {
    await goto(page, urls.chat);
    const chip = page.locator("button").filter({ hasText: "Daily routines" });
    await chip.first().click();

    await expect(
      page.getByRole("button", { name: /Talk about: Daily routines/ }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Type or dictate a message…"),
    ).toBeVisible();
  });

  test("used topics do not reappear after reload", async ({ page }) => {
    await goto(page, urls.chat);
    await page
      .locator("button")
      .filter({ hasText: "Daily routines" })
      .first()
      .click();
    await expect(
      page.getByRole("button", { name: /Talk about: Daily routines/ }),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.locator("button").filter({ hasText: /^Daily routines$/ }),
    ).toHaveCount(0);
  });

  test("deletes a conversation", async ({ page }) => {
    await goto(page, urls.chat);
    await page.getByRole("button", { name: "New conversation" }).click();
    await expect(page.getByRole("button", { name: /Practice/ })).toBeVisible();

    await page.getByRole("button", { name: /Practice/ }).hover();
    await page.getByRole("button", { name: "Delete conversation" }).click();

    await expect(page.getByText("No conversations yet.")).toBeVisible();
  });
});
