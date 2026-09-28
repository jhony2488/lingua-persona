import { pickVoice, speechLang, type VoiceLike } from "@/lib/speech";

const voices: VoiceLike[] = [
  { name: "Microsoft David - English (United States)", lang: "en-US" },
  { name: "Microsoft Zira - English (United States)", lang: "en-US" },
  { name: "Google UK English Female", lang: "en-GB" },
  { name: "Google UK English Male", lang: "en-GB" },
  { name: "Google español", lang: "es-ES" },
];

describe("speechLang", () => {
  it("maps dialects to BCP-47 tags", () => {
    expect(speechLang("US")).toBe("en-US");
    expect(speechLang("UK")).toBe("en-GB");
  });
});

describe("pickVoice", () => {
  it("prefers a male voice for the US dialect", () => {
    expect(pickVoice(voices, "US", "male")?.name).toContain("David");
  });

  it("prefers a female voice for the US dialect", () => {
    expect(pickVoice(voices, "US", "female")?.name).toContain("Zira");
  });

  it("picks a UK female voice", () => {
    expect(pickVoice(voices, "UK", "female")?.name).toBe(
      "Google UK English Female",
    );
  });

  it("does not match 'male' inside 'female'", () => {
    expect(pickVoice(voices, "UK", "male")?.name).toBe(
      "Google UK English Male",
    );
  });

  it("falls back to the first voice of the dialect when no gender matches", () => {
    const neutral: VoiceLike[] = [
      { name: "Default Voice", lang: "en-US" },
      { name: "Another Voice", lang: "en-US" },
    ];
    expect(pickVoice(neutral, "US", "female")?.name).toBe("Default Voice");
  });

  it("matches voices by language prefix when the exact locale is missing", () => {
    const generic: VoiceLike[] = [{ name: "Alex", lang: "en" }];
    expect(pickVoice(generic, "US", "male")?.name).toBe("Alex");
  });

  it("returns null when no voice matches the dialect", () => {
    const onlySpanish: VoiceLike[] = [{ name: "Google español", lang: "es" }];
    expect(pickVoice(onlySpanish, "UK", "male")).toBeNull();
  });
});
