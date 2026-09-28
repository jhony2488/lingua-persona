import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

let mockPathname = "/en-US";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

import { ProductTour } from "@/components/tour/product-tour";
import { dictionary } from "@/i18n/dictionaries/en-US";
import { I18nProvider } from "@/i18n/provider";
import { useSettings } from "@/lib/store/settings";

function renderTour() {
  return render(
    <I18nProvider locale="en-US" dict={dictionary}>
      <nav>
        <a data-tour="home">LinguaPersona</a>
        <a data-tour="chat">Chat</a>
        <a data-tour="plan">Plan</a>
        <a data-tour="settings">Settings</a>
        <span data-tour="language">EN</span>
      </nav>
      <ProductTour />
    </I18nProvider>,
  );
}

describe("ProductTour", () => {
  beforeEach(() => {
    mockPathname = "/en-US";
    useSettings.setState({ userId: null, tourCompleted: false });
  });

  it("shows the first step on mount", async () => {
    renderTour();
    const dialog = await screen.findByRole("dialog", {
      name: "Welcome to LinguaPersona",
    });
    expect(within(dialog).getByText("1 of 5")).toBeInTheDocument();
  });

  it("advances and finishes, marking the tour completed", async () => {
    const user = userEvent.setup();
    renderTour();
    const dialog = await screen.findByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: "Next" }));
    expect(within(dialog).getByText("2 of 5")).toBeInTheDocument();
    expect(within(dialog).getByText("Chat")).toBeInTheDocument();

    for (let i = 0; i < 3; i++) {
      await user.click(within(dialog).getByRole("button", { name: "Next" }));
    }
    await user.click(within(dialog).getByRole("button", { name: "Finish" }));

    expect(useSettings.getState().tourCompleted).toBe(true);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("skip marks the tour completed", async () => {
    const user = userEvent.setup();
    renderTour();
    const dialog = await screen.findByRole("dialog");

    await user.click(within(dialog).getByRole("button", { name: "Skip" }));

    expect(useSettings.getState().tourCompleted).toBe(true);
  });

  it("does not render when the tour was already completed", () => {
    useSettings.setState({ tourCompleted: true });
    renderTour();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("waits for onboarding on the chat page", async () => {
    mockPathname = "/en-US/chat";
    renderTour();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    act(() => useSettings.setState({ userId: "user-1" }));
    expect(
      await screen.findByRole("dialog", { name: "Welcome to LinguaPersona" }),
    ).toBeInTheDocument();
  });
});
