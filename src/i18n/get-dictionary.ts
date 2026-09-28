import type { Locale } from "./config";

const dictionaries = {
  "pt-BR": () => import("./dictionaries/pt-BR").then((m) => m.dictionary),
  "en-US": () => import("./dictionaries/en-US").then((m) => m.dictionary),
  "en-GB": () => import("./dictionaries/en-GB").then((m) => m.dictionary),
  es: () => import("./dictionaries/es").then((m) => m.dictionary),
};

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getDictionary = async (locale: Locale) => dictionaries[locale]();
