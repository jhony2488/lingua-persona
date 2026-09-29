import { createSTT, type SpeechRecognitionLike } from "@/lib/speech";
import {
  resampleLinear,
  WhisperRecognition,
} from "@/lib/stt/whisper.recognition";

class FakeSpeechRecognition implements SpeechRecognitionLike {
  lang = "";
  continuous = false;
  interimResults = false;
  onresult = null;
  onend = null;
  onerror = null;
  start = jest.fn();
  stop = jest.fn();
}

function setNativeRecognition(present: boolean) {
  Object.defineProperty(window, "SpeechRecognition", {
    value: present ? FakeSpeechRecognition : undefined,
    configurable: true,
    writable: true,
  });
}

function setWhisperSupport(supported: boolean) {
  Object.defineProperty(window.navigator, "mediaDevices", {
    value: supported ? { getUserMedia: jest.fn() } : undefined,
    configurable: true,
  });
  Object.defineProperty(globalThis, "Worker", {
    value: supported ? class {} : undefined,
    configurable: true,
    writable: true,
  });
}

describe("createSTT", () => {
  afterEach(() => {
    setNativeRecognition(false);
    setWhisperSupport(false);
  });

  it("prefers the native SpeechRecognition when available", () => {
    setNativeRecognition(true);
    setWhisperSupport(true);
    expect(createSTT()).toBeInstanceOf(FakeSpeechRecognition);
  });

  it("falls back to WhisperRecognition when native is unavailable", () => {
    setNativeRecognition(false);
    setWhisperSupport(true);
    expect(createSTT()).toBeInstanceOf(WhisperRecognition);
  });

  it("returns null when neither engine is supported", () => {
    setNativeRecognition(false);
    setWhisperSupport(false);
    expect(createSTT()).toBeNull();
  });
});

describe("WhisperRecognition", () => {
  it("implements the SpeechRecognitionLike surface", () => {
    const recognition = new WhisperRecognition();
    expect(recognition.lang).toBe("en-US");
    expect(recognition.continuous).toBe(true);
    expect(recognition.interimResults).toBe(false);
    expect(typeof recognition.start).toBe("function");
    expect(typeof recognition.stop).toBe("function");
  });
});

describe("resampleLinear", () => {
  it("returns a copy unchanged when rates match", () => {
    const input = new Float32Array([0, 0.5, -0.5, 1]);
    const output = resampleLinear(input, 16000, 16000);
    expect([...output]).toEqual([0, 0.5, -0.5, 1]);
  });

  it("halves the length downsampling 32kHz to 16kHz", () => {
    const input = new Float32Array([0, 1, 0, -1]);
    const output = resampleLinear(input, 32000, 16000);
    expect(output.length).toBe(2);
    expect(output[0]).toBeCloseTo(0);
    expect(output[1]).toBeCloseTo(0); // interpola índices 2 e 3
  });
});
