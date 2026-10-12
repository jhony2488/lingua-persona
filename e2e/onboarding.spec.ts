import { test, expect, urls, goto } from "./fixtures";

test.describe("Onboarding", () => {
  test("shows dialog for new visitor", async ({ page }) => {
    await goto(page, urls.chat);
    await expect(
      page.getByRole("heading", { name: "Welcome to LinguaPersona" }),
    ).toBeVisible();
    await expect(page.getByPlaceholder("Your name")).not.toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
  });

  test("creates profile with valid data", async ({ page }) => {
    const email = `e2e-onboard-${Date.now()}@example.com`;
    await goto(page, urls.chat);
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByPlaceholder("Your name").fill("Ana");
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

  test("restores an existing profile for duplicate email", async ({ page, request }) => {
    const email = `e2e-dup-${Date.now()}@example.com`;
    const created = await request.post("/api/users", {
      data: {
        name: "Existing",
        email,
        englishLevel: "B2",
        preferredDialect: "UK",
      },
    });
    const existing = (await created.json()) as { id: string };

    await goto(page, urls.chat);
    await page.getByPlaceholder("you@example.com").fill(email);
    await expect(page.getByPlaceholder("Your name")).not.toBeVisible();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(
      page.getByRole("heading", { name: "Welcome to LinguaPersona" }),
    ).not.toBeVisible();

    const settings = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("linguapersona-settings") ?? "{}"),
    );
    expect(settings.state).toMatchObject({
      userId: existing.id,
      level: "B2",
      dialect: "UK",
    });
    await expect(page.getByPlaceholder("Your name")).not.toBeVisible();
  });
});
