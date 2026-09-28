import { dictionary as enUS, type Dictionary } from "./en-US";

export const dictionary: Dictionary = {
  ...enUS,
  home: {
    ...enUS.home,
    heroSubtitle:
      "LinguaPersona is a private, installable web app that lets you practise English conversation with an adaptive virtual teacher — running mostly on your own device.",
    startPracticing: "Start practising",
  },
  settings: {
    ...enUS.settings,
    description: "Personalise how your virtual teacher talks and teaches.",
  },
};
