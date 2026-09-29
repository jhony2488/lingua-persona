import type {
  SpeechRecognitionEventLike,
  SpeechRecognitionLike,
} from "@/lib/speech";
import { isWhisperSupported, transcribeAudio } from "@/lib/stt/whisper.engine";

const TARGET_RATE = 16_000;
const SILENCE_RMS = 0.012;
const SILENCE_MS = 2_000;
const METER_INTERVAL_MS = 100;

/**
 * Adapter SpeechRecognitionLike sobre Whisper on-device (transformers.js).
 * Fallback para webviews sem Web Speech API (Tauri, Firefox, parte do mobile).
 * Não emite resultados parciais — cada fala gera um resultado `isFinal`.
 * Silêncio ~2s após fala finaliza a transcrição automaticamente.
 */
export class WhisperRecognition implements SpeechRecognitionLike {
  lang = "en-US";
  continuous = true;
  interimResults = false;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private meterTimer: ReturnType<typeof setInterval> | null = null;
  private chunks: Blob[] = [];
  private active = false;
  private finalizing = false;
  private hasSpeech = false;
  private lastSpeechAt = 0;

  start(): void {
    if (this.active || this.finalizing) return;
    this.active = true;
    this.chunks = [];
    this.hasSpeech = false;
    void this.capture().catch(() => {
      this.cleanup();
      this.onerror?.();
      this.onend?.();
    });
  }

  stop(): void {
    if (!this.active && !this.finalizing) return;
    void this.finalize();
  }

  private async capture(): Promise<void> {
    if (!isWhisperSupported()) throw new Error("Whisper unsupported");
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (!this.active) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    this.stream = stream;

    const Ctor =
      window.AudioContext ??
      (window as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    const context = new Ctor();
    this.audioContext = context;
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    this.startSilenceMeter(analyser);

    const recorder = new MediaRecorder(stream);
    this.recorder = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };
    recorder.onstop = () => {
      void this.transcribe();
    };
    recorder.start();
  }

  private startSilenceMeter(analyser: AnalyserNode): void {
    const buffer = new Float32Array(analyser.fftSize);
    this.meterTimer = setInterval(() => {
      if (!this.active || this.finalizing) return;
      analyser.getFloatTimeDomainData(buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
      const rms = Math.sqrt(sum / buffer.length);
      const now = Date.now();
      if (rms > SILENCE_RMS) {
        this.hasSpeech = true;
        this.lastSpeechAt = now;
      } else if (this.hasSpeech && now - this.lastSpeechAt > SILENCE_MS) {
        void this.finalize();
      }
    }, METER_INTERVAL_MS);
  }

  private async finalize(): Promise<void> {
    if (this.finalizing) return;
    this.finalizing = true;
    this.active = false;
    if (this.meterTimer) clearInterval(this.meterTimer);
    this.meterTimer = null;
    if (this.recorder && this.recorder.state !== "inactive") {
      this.recorder.stop(); // onstop → transcribe()
    } else {
      this.cleanup();
      this.onend?.();
    }
  }

  private async transcribe(): Promise<void> {
    this.cleanupStream(); // solta o mic assim que a gravação encerra
    try {
      const transcript =
        this.chunks.length > 0 && this.hasSpeech
          ? await this.transcribeBlob(new Blob(this.chunks))
          : "";
      if (transcript) {
        this.onresult?.({
          resultIndex: 0,
          results: [{ isFinal: true, 0: { transcript } }],
        });
      }
    } catch {
      this.onerror?.();
    } finally {
      this.chunks = [];
      this.cleanup();
      this.onend?.();
    }
  }

  private async transcribeBlob(blob: Blob): Promise<string> {
    const samples = await decodeToMonoPcm(blob);
    return transcribeAudio(samples);
  }

  private cleanupStream(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    void this.audioContext?.close().catch(() => {});
    this.audioContext = null;
    this.recorder = null;
  }

  private cleanup(): void {
    this.active = false;
    this.finalizing = false;
    if (this.meterTimer) clearInterval(this.meterTimer);
    this.meterTimer = null;
    this.cleanupStream();
  }
}

/** Decodifica o blob gravado e reamostra para PCM mono 16kHz (whisper). */
export async function decodeToMonoPcm(blob: Blob): Promise<Float32Array> {
  const buffer = await blob.arrayBuffer();
  const Ctor =
    window.AudioContext ??
    (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  const context = new Ctor();
  try {
    const audio = await context.decodeAudioData(buffer);
    const data = audio.getChannelData(0);
    if (audio.sampleRate === TARGET_RATE) return data;
    return resampleLinear(data, audio.sampleRate);
  } finally {
    void context.close().catch(() => {});
  }
}

/** Reamostragem linear para o sample rate do whisper — suficiente para ASR. */
export function resampleLinear(
  data: Float32Array,
  fromRate: number,
  toRate = TARGET_RATE,
): Float32Array {
  const ratio = fromRate / toRate;
  const length = Math.floor(data.length / ratio);
  const output = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const next = Math.min(idx + 1, data.length - 1);
    output[i] = data[idx] * (1 - frac) + data[next] * frac;
  }
  return output;
}
