import {
  buildSystemPrompt,
  stripForSpeech,
  toChatMessages,
} from "@/modules/assistant/prompt";
import type { ChatContext } from "@/lib/llm/types";

const ctx: ChatContext = {
  level: "B1",
  dialect: "US",
  agentName: "Alex",
  agentGender: "male",
};

describe("buildSystemPrompt", () => {
  it("includes persona, dialect and level", () => {
    const prompt = buildSystemPrompt(ctx, "medium");
    expect(prompt).toContain('"Alex"');
    expect(prompt).toContain("American English");
    expect(prompt).toContain("CEFR B1");
  });

  it("adapts dialect to UK English", () => {
    const prompt = buildSystemPrompt({ ...ctx, dialect: "UK" }, "medium");
    expect(prompt).toContain("British English");
    expect(prompt).toContain("colour");
  });

  it.each([
    ["A1", "mostly in Portuguese"],
    ["A2", "50/50"],
    ["B1", "80% in English"],
    ["B2", "100% in English"],
    ["C1", "native speaker"],
    ["C2", "native speaker"],
  ])("adapts instructions for level %s", (level, expected) => {
    const prompt = buildSystemPrompt({ ...ctx, level }, "large");
    expect(prompt).toContain(expected);
  });

  it("keeps full pedagogy rules for medium/large tiers", () => {
    for (const tier of ["medium", "large"] as const) {
      const prompt = buildSystemPrompt(ctx, tier);
      expect(prompt).toContain("Quick Feedback");
      expect(prompt).toContain("**bold**");
    }
  });

  it("simplifies rules for tiny/small tiers", () => {
    for (const tier of ["tiny", "small"] as const) {
      const prompt = buildSystemPrompt(ctx, tier);
      expect(prompt).not.toContain("Quick Feedback");
      expect(prompt).toContain("question");
    }
  });

  it("appends injected context entries when present", () => {
    const prompt = buildSystemPrompt(
      { ...ctx, context: ["confuses since and for"] },
      "medium",
    );
    expect(prompt).toContain("confuses since and for");
  });
});

describe("toChatMessages", () => {
  const history = Array.from({ length: 20 }, (_, i) => ({
    role: i % 2 === 0 ? "user" : "assistant",
    content: `msg ${i}`,
  }));

  it("prepends the system prompt and caps history to the tier window", () => {
    const messages = toChatMessages(history, "SYS", 4);
    expect(messages[0]).toEqual({ role: "system", content: "SYS" });
    expect(messages).toHaveLength(5);
    expect(messages.at(-1)).toEqual({ role: "assistant", content: "msg 19" });
  });

  it("ignores roles that are not user/assistant", () => {
    const messages = toChatMessages(
      [{ role: "system", content: "x" }, ...history.slice(-2)],
      "SYS",
      10,
    );
    expect(messages.filter((m) => m.role === "system")).toHaveLength(1);
  });
});

describe("stripForSpeech", () => {
  it("removes the feedback section and markdown for TTS", () => {
    const reply =
      "Nice! **Brilliant** choice of words.\n\n---\n💡 Quick Feedback:\n- Instead of: 'I go'.";
    expect(stripForSpeech(reply)).toBe("Nice! Brilliant choice of words.");
  });

  it("keeps plain replies untouched", () => {
    expect(stripForSpeech("Hello there!")).toBe("Hello there!");
  });
});
