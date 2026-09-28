import { test, expect, urls } from "./fixtures";

test.describe("Onboarding", () => {
  test("shows dialog for new visitor", async ({ page }) => {
    await page.goto(urls.chat);
    await expect(
      page.getByRole("heading", { name: "Welcome to LinguaPersona" }),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder("Your name"),
    ).toBeVisible();
  });

  test("creates profile with valid data", async ({ page }) => {
    const email = `e2e-onboard-${Date.now()}@example.com`;
    await page.goto(urls.chat);
    await page.getByPlaceholder("Your name").fill("Ana");
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByRole("button", { name: "Start" }).click();

    await expect(
      page.getByRole("heading", { name: "Welcome to LinguaPersona" }),
    ).not.toBeVisible();

    const stored = await page.evaluate(() =>
      localStorage.getItem("linguapersona-settings"),
    );
    expect(stored).toContain('"userId"');
    expect(stored).not.toContain('"userId":null');
  });

  test("shows error for duplicate email", async ({ page, request }) => {
    const email = `e2e-dup-${Date.now()}@example.com`;
    await request.post("/api/users", {
      data: { name: "Existing", email },
    });

    await page.goto(urls.chat);
    await page.getByPlaceholder("Your name").fill("Dup");
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByRole("button", { name: "Start" }).click();

    await expect(
      page.getByText("Could not create your profile"),
    ).toBeVisible();
  });
});
