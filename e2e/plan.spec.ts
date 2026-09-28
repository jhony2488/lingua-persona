// e2e/features/plan.feature
import { test, expect, urls, seedProfile } from "./fixtures";

test.describe("Study plan", () => {
  test("visitor without profile sees onboarding CTA", async ({ page }) => {
    await page.goto(urls.plan);
    await expect(
      page.getByText("Create your teacher profile first"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Go to chat" }),
    ).toBeVisible();
  });

  test("generates a 4-week plan", async ({ page, userId }) => {
    await seedProfile(page, userId);
    await page.goto(urls.plan);

    await page.getByLabel("Weeks").selectOption("4");
    await page.getByRole("button", { name: "Generate plan" }).click();

    await expect(
      page.getByRole("heading", { name: /4-week balanced plan at A1/ }),
    ).toBeVisible();
    await expect(page.getByText(/^Week 1:/)).toBeVisible();
    await expect(page.getByText(/^Week 4:/)).toBeVisible();
  });

  test("speaking focus removes study references", async ({ page, userId }) => {
    await seedProfile(page, userId);
    await page.goto(urls.plan);

    await page.getByLabel("Focus").selectOption("speaking");
    await page.getByRole("button", { name: "Generate plan" }).click();

    await expect(page.getByText(/^Week 1:/)).toBeVisible();
    await expect(page.getByText(/^Study:/)).toHaveCount(0);
  });
});
