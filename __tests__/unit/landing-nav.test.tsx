import { render, screen } from "@testing-library/react";

import { LandingNav } from "@/components/landing/nav";
import { dictionary } from "@/i18n/dictionaries/en-US";

describe("LandingNav", () => {
  it("renders fixed header with theme toggle and language switcher", () => {
    const { container } = render(
      <LandingNav dict={dictionary} locale="en-US" onLocaleChange={() => {}} />,
    );

    expect(container.querySelector("header")).toHaveClass("fixed");
    // next/image reescreve o src (/_next/image?url=...) — match por substring.
    expect(container.querySelector('img[src*="logo.png"]')).not.toBeNull();
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
    expect(screen.getByLabelText("Language")).toBeInTheDocument();
  });
});
