import type { AgentGender, Dialect } from "@/lib/store/settings";

export interface SpeechRecognitionResultItem {
  transcript: string;
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: SpeechRecognitionResultItem }>;
}

export interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

export function speechLang(dialect: Dialect): string {
  return dialect === "UK" ? "en-GB" : "en-US";
}

export function createSpeechRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

const MALE_HINTS = /\b(male|david|alex|daniel|fred|george)/i;
const FEMALE_HINTS =
  /\b(female|samantha|victoria|kate|stephanie|zira|susan)/i;

export interface VoiceLike {
  lang: string;
  name: string;
}

function normalizeLang(lang: string): string {
  return lang.toLowerCase().replace("_", "-");
}

export function pickVoice<T extends VoiceLike>(
  voices: T[],
  dialect: Dialect,
  gender: AgentGender,
): T | null {
  const lang = normalizeLang(speechLang(dialect));
  const exact = voices.filter((v) => normalizeLang(v.lang) === lang);
  const byLang = exact.length
    ? exact
    : voices.filter(
        (v) => normalizeLang(v.lang).split("-")[0] === lang.split("-")[0],
      );
  if (byLang.length === 0) return null;

  const hints = gender === "female" ? FEMALE_HINTS : MALE_HINTS;
  const match = byLang.find((v) => hints.test(v.name));
  return match ?? byLang[0];
}

interface SpeakOptions {
  dialect: Dialect;
  gender?: AgentGender;
  onEnd?: () => void;
}

export function speak(text: string, options: SpeakOptions): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    options.onEnd?.();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLang(options.dialect);

  const applyVoice = () => {
    if (!options.gender) return;
    const voice = pickVoice(
      window.speechSynthesis.getVoices(),
      options.dialect,
      options.gender,
    );
    if (voice) utterance.voice = voice;
  };

  if (window.speechSynthesis.getVoices().length > 0) {
    applyVoice();
  } else {
    window.speechSynthesis.onvoiceschanged = applyVoice;
  }

  if (options.onEnd) {
    utterance.onend = options.onEnd;
    utterance.onerror = options.onEnd;
  }

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
