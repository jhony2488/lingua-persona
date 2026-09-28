import { test as base, expect } from "@playwright/test";

const LOCALE = "en-US";
const SETTINGS_KEY = "linguapersona-settings";

export interface E2EFixtures {
  userId: string;
}

/** Cria um usuário real via API e limpa no final (cascade cobre o resto). */
export const test = base.extend<E2EFixtures>({
  userId: async ({ request }, use) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const res = await request.post("/api/users", {
      data: {
        name: "E2E User",
        email: `e2e-${unique}@example.com`,
        englishLevel: "A1",
        preferredDialect: "US",
      },
    });
    const user = (await res.json()) as { id: string };
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Playwright fixture API
    await use(user.id);
    await request.delete(`/api/users/${user.id}`).catch(() => {});
  },
});

/** Injeta o settings store do Zustand com o userId antes de qualquer script. */
export async function seedProfile(
  page: import("@playwright/test").Page,
  userId: string,
  overrides: Record<string, unknown> = {},
) {
  await page.addInitScript(
    ({ key, id, extra }) => {
      // Só semeia se ainda não houver store — reloads preservam alterações.
      if (localStorage.getItem(key)) return;
      localStorage.setItem(
        key,
        JSON.stringify({
          state: {
            userId: id,
            dialect: "US",
            level: "A1",
            agentName: "Alex",
            agentGender: "male",
            chatMode: "chat",
            voiceFlow: "auto",
            ...extra,
          },
          version: 0,
        }),
      );
    },
    { key: SETTINGS_KEY, id: userId, extra: overrides },
  );
}

/** goto + espera networkidle — evita cliques/fills revertidos pela hidratação. */
export async function goto(page: import("@playwright/test").Page, url: string) {
  await page.goto(url);
  await page.waitForLoadState("networkidle");
}

export const urls = {
  home: `/${LOCALE}`,
  chat: `/${LOCALE}/chat`,
  plan: `/${LOCALE}/plan`,
  settings: `/${LOCALE}/settings`,
  offline: `/${LOCALE}/~offline`,
};

export { expect };
