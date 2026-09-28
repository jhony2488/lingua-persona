import { test, expect, urls, goto, seedProfile } from "./fixtures";

const tourDialog = (page: import("@playwright/test").Page) =>
  page.getByRole("dialog", { name: "Welcome to LinguaPersona" });

test.describe("Product tour", () => {
  test("shows on first visit and persists completion", async ({ page }) => {
    await goto(page, urls.home, { tour: true });

    const dialog = tourDialog(page);
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("1 of 5")).toBeVisible();

    await dialog.getByRole("button", { name: "Next" }).click();
    await expect(dialog.getByText("2 of 5")).toBeVisible();
    await dialog.getByRole("button", { name: "Next" }).click();
    await dialog.getByRole("button", { name: "Next" }).click();
    await dialog.getByRole("button", { name: "Next" }).click();
    await dialog.getByRole("button", { name: "Finish" }).click();
    await expect(dialog).not.toBeVisible();

    await page.reload();
    await expect(dialog).not.toBeVisible();
  });

  test("waits for onboarding on the chat page", async ({ page }) => {
    await goto(page, urls.chat, { tour: true });

    await expect(
      page.getByRole("heading", { name: "Welcome to LinguaPersona" }),
    ).toBeVisible();
    await expect(tourDialog(page)).not.toBeVisible();

    const email = `e2e-tour-${Date.now()}@example.com`;
    await page.getByPlaceholder("Your name").fill("Tour");
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByRole("button", { name: "Start" }).click();

    await expect(tourDialog(page)).toBeVisible();
  });

  test("replays from settings", async ({ page, userId }) => {
    await seedProfile(page, userId);
    await goto(page, urls.settings);

    await expect(tourDialog(page)).not.toBeVisible();
    await page.getByRole("button", { name: "Replay" }).click();
    await expect(tourDialog(page)).toBeVisible();
  });
});
