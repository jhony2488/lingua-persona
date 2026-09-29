import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  THEME_STORAGE_KEY,
  ThemeToggle,
} from "@/components/landing/theme-toggle";

describe("ThemeToggle", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
    localStorage.clear();
  });

  it("starts light by default and toggles to dark", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle label="Toggle theme" />);
    const button = screen.getByRole("button", { name: "Toggle theme" });

    expect(document.documentElement.classList.contains("dark")).toBe(false);

    await user.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(button).toHaveAttribute("aria-pressed", "true");

    await user.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });
});
