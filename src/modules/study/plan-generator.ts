import type { EnglishLevel } from "@/lib/store/settings";
import {
  ALL_LEVELS,
  topicsForLevel,
  topicsUpToLevel,
  type Topic,
} from "@/modules/study/topics.data";

export interface ManifestBook {
  slug: string;
  title: string;
  author?: string;
  type?: "study" | "reading";
  level?: string;
}

export interface GeneratePlanInput {
  level: EnglishLevel;
  weeks: number;
  focus?: "grammar" | "speaking" | "balanced";
  /** Temas/títulos já usados em conversas — excluídos dos tópicos. */
  usedTopics: string[];
  books: ManifestBook[];
}

export interface WeekPlan {
  week: number;
  theme: string;
  topics: string[];
  study: { slug: string; title: string }[];
  reading: { slug: string; title: string } | null;
  goals: string[];
}

export interface PlanJson {
  summary: string;
  level: EnglishLevel;
  focus: string;
  weeks: WeekPlan[];
}

const levelIndex = (level: string): number =>
  ALL_LEVELS.indexOf(level as EnglishLevel);

function booksAtLevel(books: ManifestBook[], level: EnglishLevel) {
  const idx = levelIndex(level);
  const eligible = (book: ManifestBook) =>
    book.level !== undefined && levelIndex(book.level) <= idx;
  return {
    study: books.filter((b) => b.type === "study" && eligible(b)),
    reading: books.filter((b) => b.type === "reading" && eligible(b)),
  };
}

function availableTopics(level: EnglishLevel, used: string[]): Topic[] {
  const normalized = new Set(used.map((t) => t.toLowerCase()));
  return topicsUpToLevel(level).filter(
    (t) => !normalized.has(t.theme.toLowerCase()),
  );
}

function goalsForWeek(
  theme: string,
  hasStudy: boolean,
  hasReading: boolean,
  focus: string,
): string[] {
  const goals = [`Hold a conversation about "${theme}"`];
  if (hasStudy)
    goals.push("Complete the referenced grammar/vocabulary section");
  if (hasReading) goals.push("Read the next section of the assigned book");
  if (focus === "grammar" || focus === "balanced")
    goals.push("Write 5 sentences using this week's grammar point");
  if (focus === "speaking" || focus === "balanced")
    goals.push("Record or speak a 1-minute monologue on the theme");
  return goals;
}

export function generatePlan(input: GeneratePlanInput): PlanJson {
  const focus = input.focus ?? "balanced";
  const { study, reading } = booksAtLevel(input.books, input.level);
  const topics = availableTopics(input.level, input.usedTopics);
  const ownLevelTopics = topicsForLevel(input.level).filter(
    (t) =>
      !input.usedTopics
        .map((x) => x.toLowerCase())
        .includes(t.theme.toLowerCase()),
  );

  const weeks: WeekPlan[] = [];
  for (let week = 1; week <= input.weeks; week++) {
    // Prefer topics of the user's own level, cycling through the bank.
    const pool = ownLevelTopics.length > 0 ? ownLevelTopics : topics;
    const themeTopic = pool[(week - 1) % Math.max(pool.length, 1)];
    const topicsForWeek = themeTopic
      ? [
          themeTopic.theme,
          ...pool
            .filter((t) => t !== themeTopic)
            .slice(0, 2)
            .map((t) => t.theme),
        ]
      : [];

    const studyForWeek = study
      .filter((_, i) => i % input.weeks === (week - 1) % input.weeks)
      .slice(0, 1)
      .map((b) => ({ slug: b.slug, title: b.title }));
    // Fallback: se não há livro de estudo para a semana, pega do início da lista.
    const studyItems =
      studyForWeek.length > 0
        ? studyForWeek
        : study.slice(0, 1).map((b) => ({ slug: b.slug, title: b.title }));

    const readingBook =
      reading.length > 0 ? reading[(week - 1) % reading.length] : null;

    weeks.push({
      week,
      theme: themeTopic?.theme ?? "Free conversation",
      topics: topicsForWeek,
      study: focus === "speaking" ? [] : studyItems,
      reading: readingBook
        ? { slug: readingBook.slug, title: readingBook.title }
        : null,
      goals: goalsForWeek(
        themeTopic?.theme ?? "free conversation",
        focus !== "speaking" && studyItems.length > 0,
        readingBook !== null,
        focus,
      ),
    });
  }

  return {
    summary: `${input.weeks}-week ${focus} plan at ${input.level} level`,
    level: input.level,
    focus,
    weeks,
  };
}
