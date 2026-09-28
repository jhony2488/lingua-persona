import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

describe("Page", () => {
  it("renders the hero heading", () => {
    render(<Page />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /learn english/i,
      }),
    ).toBeInTheDocument();
  });

  it("links to chat and settings", () => {
    render(<Page />);
    expect(
      screen.getByRole("link", { name: /start practicing/i }),
    ).toHaveAttribute("href", "/chat");
    expect(
      screen.getByRole("link", { name: /configure teacher/i }),
    ).toHaveAttribute("href", "/settings");
  });
});
