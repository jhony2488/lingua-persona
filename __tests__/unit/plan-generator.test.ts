import {
  generatePlan,
  type ManifestBook,
} from "@/modules/study/plan-generator";
import {
  ALL_LEVELS,
  TOPICS_BY_LEVEL,
  topicsForLevel,
  topicsUpToLevel,
} from "@/modules/study/topics.data";

const books: ManifestBook[] = [
  {
    slug: "graded-lessons-english",
    title: "Graded Lessons",
    type: "study",
    level: "B1",
  },
  {
    slug: "advanced-grammar",
    title: "Advanced Grammar",
    type: "study",
    level: "C1",
  },
  { slug: "alice", title: "Alice", type: "reading", level: "B1" },
  { slug: "moby-dick", title: "Moby Dick", type: "reading", level: "C2" },
];

describe("topics bank integrity", () => {
  it.each(ALL_LEVELS)("%s has topics with prompts", (level) => {
    const topics = TOPICS_BY_LEVEL[level];
    expect(topics.length).toBeGreaterThanOrEqual(7);
    for (const topic of topics) {
      expect(topic.theme.length).toBeGreaterThan(3);
      expect(topic.prompts.length).toBeGreaterThan(0);
    }
  });

  it("topicsUpToLevel includes previous level", () => {
    expect(topicsUpToLevel("B2").length).toBeGreaterThan(
      topicsForLevel("B2").length,
    );
  });
});

describe("generatePlan", () => {
  it("produces the requested number of weeks", () => {
    const plan = generatePlan({
      level: "B1",
      weeks: 4,
      focus: "balanced",
      usedTopics: [],
      books,
    });
    expect(plan.weeks).toHaveLength(4);
    expect(plan.level).toBe("B1");
    expect(plan.summary).toContain("B1");
  });

  it("only includes books at or below the user's level", () => {
    const plan = generatePlan({
      level: "B1",
      weeks: 2,
      usedTopics: [],
      books,
    });
    const studyTitles = plan.weeks.flatMap((w) => w.study.map((s) => s.title));
    expect(studyTitles).not.toContain("Advanced Grammar");

    const readingTitles = plan.weeks
      .map((w) => w.reading?.title)
      .filter(Boolean);
    expect(readingTitles).not.toContain("Moby Dick");
    expect(readingTitles).toContain("Alice");
  });

  it("excludes used topics", () => {
    const theme = topicsForLevel("B1")[0].theme;
    const plan = generatePlan({
      level: "B1",
      weeks: 3,
      usedTopics: [theme],
      books,
    });
    const allTopics = plan.weeks.flatMap((w) => w.topics);
    expect(allTopics).not.toContain(theme);
  });

  it("removes study items in speaking focus", () => {
    const plan = generatePlan({
      level: "B1",
      weeks: 2,
      focus: "speaking",
      usedTopics: [],
      books,
    });
    expect(plan.weeks.every((w) => w.study.length === 0)).toBe(true);
  });

  it("works with an empty book corpus (A1 scenario)", () => {
    const plan = generatePlan({
      level: "A1",
      weeks: 2,
      usedTopics: [],
      books: [],
    });
    expect(plan.weeks).toHaveLength(2);
    expect(plan.weeks[0].topics.length).toBeGreaterThan(0);
  });
});
