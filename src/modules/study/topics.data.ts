/**
 * Banco de tópicos de conversação por nível CEFR.
 * Dados puros — seguro para importar em client e server.
 */
import type { EnglishLevel } from "@/lib/store/settings";

export interface Topic {
  theme: string;
  prompts: string[];
}

export const TOPICS_BY_LEVEL: Record<EnglishLevel, Topic[]> = {
  A1: [
    {
      theme: "Introductions and greetings",
      prompts: ["What's your name?", "Where are you from?"],
    },
    {
      theme: "Family and friends",
      prompts: ["How many people are in your family?"],
    },
    {
      theme: "Food and drinks",
      prompts: ["What do you eat for breakfast?"],
    },
    {
      theme: "Colors and things",
      prompts: ["What color is your phone?"],
    },
    {
      theme: "Daily routines",
      prompts: ["What time do you wake up?"],
    },
    {
      theme: "Numbers, dates and time",
      prompts: ["What day is today?"],
    },
    {
      theme: "My home",
      prompts: ["How many rooms are in your house?"],
    },
    {
      theme: "Likes and dislikes",
      prompts: ["Do you like music?"],
    },
  ],
  A2: [
    {
      theme: "Shopping and prices",
      prompts: ["What did you buy last week?"],
    },
    {
      theme: "Travel and directions",
      prompts: ["How do you get to work or school?"],
    },
    {
      theme: "Weather and seasons",
      prompts: ["What's the weather like today?"],
    },
    {
      theme: "Hobbies and free time",
      prompts: ["What do you do on weekends?"],
    },
    {
      theme: "Past events",
      prompts: ["Where did you go last vacation?"],
    },
    {
      theme: "Health and body",
      prompts: ["Do you exercise?"],
    },
    {
      theme: "Jobs and work",
      prompts: ["What do you do?"],
    },
    {
      theme: "Describing people",
      prompts: ["What does your best friend look like?"],
    },
  ],
  B1: [
    {
      theme: "Plans and future",
      prompts: ["What are your plans for next year?"],
    },
    {
      theme: "Experiences and achievements",
      prompts: ["What is the best thing you ever did?"],
    },
    {
      theme: "Technology in daily life",
      prompts: ["What apps do you use every day?"],
    },
    {
      theme: "Education and learning",
      prompts: ["Why are you learning English?"],
    },
    {
      theme: "City vs countryside",
      prompts: ["Do you prefer the city or the countryside?"],
    },
    {
      theme: "Opinions and preferences",
      prompts: ["What kind of movies do you like?"],
    },
    {
      theme: "Problems and advice",
      prompts: ["What should a visitor do in your city?"],
    },
    {
      theme: "Money and spending",
      prompts: ["Are you good at saving money?"],
    },
    {
      theme: "Stories and anecdotes",
      prompts: ["Tell me about a funny moment in your life."],
    },
  ],
  B2: [
    {
      theme: "Environment and sustainability",
      prompts: ["How can people reduce waste?"],
    },
    {
      theme: "Work and careers",
      prompts: ["What makes a good leader?"],
    },
    {
      theme: "Social media and society",
      prompts: ["Does social media connect or isolate us?"],
    },
    {
      theme: "News and current events",
      prompts: ["What is in the news in your country?"],
    },
    {
      theme: "Travel and culture shock",
      prompts: ["What customs surprise foreigners in your country?"],
    },
    {
      theme: "Health and lifestyle",
      prompts: ["Is modern life healthy?"],
    },
    {
      theme: "Books, films and media",
      prompts: ["Recommend a book or film and defend your choice."],
    },
    {
      theme: "Technology change",
      prompts: ["How has the internet changed communication?"],
    },
    {
      theme: "Hypotheticals",
      prompts: ["What would you do with a year off?"],
    },
  ],
  C1: [
    {
      theme: "Language and identity",
      prompts: ["Can you think differently in another language?"],
    },
    {
      theme: "Ethics and dilemmas",
      prompts: ["Is it ever right to lie?"],
    },
    {
      theme: "Art and aesthetics",
      prompts: ["What makes something art?"],
    },
    {
      theme: "Economics and inequality",
      prompts: ["Should everyone receive a basic income?"],
    },
    {
      theme: "Science and society",
      prompts: ["Should we edit the human genome?"],
    },
    {
      theme: "Globalization",
      prompts: ["Is globalization killing local culture?"],
    },
    {
      theme: "Education systems",
      prompts: ["How should schools change for the future?"],
    },
    {
      theme: "Persuasion and debate",
      prompts: ["Defend an opinion you disagree with."],
    },
  ],
  C2: [
    {
      theme: "Philosophy of mind",
      prompts: ["Can machines truly think?"],
    },
    {
      theme: "Political philosophy",
      prompts: ["What is the proper role of government?"],
    },
    {
      theme: "Nuanced argumentation",
      prompts: ["Analyze an issue where both sides have merit."],
    },
    {
      theme: "Irony and humor",
      prompts: ["Explain a joke from your culture that doesn't translate."],
    },
    {
      theme: "History and causality",
      prompts: ["What historical event shaped today's world most?"],
    },
    {
      theme: "Rhetoric and style",
      prompts: ["Rewrite a simple idea in three registers."],
    },
    {
      theme: "Abstract speculation",
      prompts: ["What might post-scarcity society look like?"],
    },
  ],
};

export const ALL_LEVELS: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export function topicsForLevel(level: EnglishLevel): Topic[] {
  return TOPICS_BY_LEVEL[level] ?? [];
}

/** Tópicos do nível e do nível imediatamente anterior (progressão natural). */
export function topicsUpToLevel(level: EnglishLevel): Topic[] {
  const idx = ALL_LEVELS.indexOf(level);
  const start = Math.max(0, idx - 1);
  return ALL_LEVELS.slice(start, idx + 1).flatMap(topicsForLevel);
}
