import { render, screen } from "@testing-library/react";
import Page from "@/app/[lang]/page";

const renderPage = async (lang = "en-US") =>
  render(
    await Page({
      params: Promise.resolve({ lang }),
      searchParams: Promise.resolve({}),
    }),
  );

describe("Page", () => {
  it("renders the hero heading", async () => {
    await renderPage();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /learn english/i,
      }),
    ).toBeInTheDocument();
  });

  it("links to the localized chat and settings", async () => {
    await renderPage();
    expect(
      screen.getByRole("link", { name: /start practicing/i }),
    ).toHaveAttribute("href", "/en-US/chat");
    expect(
      screen.getByRole("link", { name: /configure teacher/i }),
    ).toHaveAttribute("href", "/en-US/settings");
  });

  it("renders a localized hero for pt-BR", async () => {
    await renderPage("pt-BR");
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /aprenda inglês/i,
      }),
    ).toBeInTheDocument();
  });
});
