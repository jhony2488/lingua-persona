import { render, screen } from "@testing-library/react";

// detect.ts importa @formatjs/intl-localematcher (ESM-only) — mock evita
// carregar o pacote no jest.
jest.mock("@/i18n/detect", () => ({
  detectClientLocale: () => "pt-BR",
}));

import { dictionary } from "@/i18n/dictionaries/pt-BR";
import { Landing } from "@/components/landing/landing";

describe("Landing (LANDING_PAGE=1)", () => {
  it("renders hero, sections and repository links", () => {
    render(<Landing dict={dictionary} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      /professor de IA/i,
    );

    // CTA primário → releases
    expect(
      screen.getAllByRole("link", { name: /releases|baixar/i })[0],
    ).toHaveAttribute(
      "href",
      "https://github.com/jhony2488/lingua-persona/releases",
    );

    // repo + contribuição + licença
    expect(screen.getByRole("link", { name: /repositório/i })).toHaveAttribute(
      "href",
      "https://github.com/jhony2488/lingua-persona",
    );
    expect(
      screen.getAllByRole("link", { name: /contribuir/i })[0],
    ).toHaveAttribute(
      "href",
      "https://github.com/jhony2488/lingua-persona/blob/master/CONTRIBUTING.md",
    );
    expect(screen.getByRole("link", { name: /licença/i })).toHaveAttribute(
      "href",
      "https://github.com/jhony2488/lingua-persona/blob/master/LICENSE",
    );

    // seções novas
    expect(
      screen.getByRole("heading", { name: /como funciona/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("A1–C2")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);

    // app oculto: nenhum link para rotas localizadas
    expect(
      screen.queryByRole("link", { name: /open the app|abrir o app/i }),
    ).not.toBeInTheDocument();
  });

  it("includes JSON-LD structured data", () => {
    const { container } = render(<Landing dict={dictionary} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).not.toBeNull();
    const data = JSON.parse(script!.textContent ?? "{}") as {
      "@type": string;
      name: string;
    };
    expect(data["@type"]).toBe("WebApplication");
    expect(data.name).toBe("LinguaPersona");
  });
});
