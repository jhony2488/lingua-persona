import type {
  WhisperWorkerRequest,
  WhisperWorkerResponse,
} from "@/lib/stt/types";

interface PendingTranscribe {
  resolve: (text: string) => void;
  reject: (error: Error) => void;
}

let worker: Worker | null = null;
let initPromise: Promise<void> | null = null;
let nextId = 0;
const pending = new Map<number, PendingTranscribe>();
let progressCallback: ((text: string) => void) | null = null;

/** Mic + WASM são o mínimo para o fallback Whisper. */
export function isWhisperSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof WebAssembly !== "undefined" &&
    typeof Worker !== "undefined"
  );
}

function ensureWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("./whisper.worker.ts", import.meta.url), {
    type: "module",
  });
  worker.onmessage = (event: MessageEvent<WhisperWorkerResponse>) => {
    const message = event.data;
    if (message.type === "progress") {
      progressCallback?.(message.text);
      return;
    }
    if (message.type === "ready") {
      progressCallback?.("whisper pronto");
      return;
    }
    if (message.type === "result") {
      const entry = pending.get(message.id);
      if (entry) {
        pending.delete(message.id);
        entry.resolve(message.text);
      }
      return;
    }
    if (message.type === "error") {
      if (message.id !== undefined) {
        const entry = pending.get(message.id);
        if (entry) {
          pending.delete(message.id);
          entry.reject(new Error(message.message));
        }
      }
      // Erros de init são propagados por initPromise/catch do caller.
    }
  };
  return worker;
}

function send(message: WhisperWorkerRequest, transfer?: Transferable[]) {
  ensureWorker().postMessage(message, transfer ?? []);
}

/**
 * Pré-aquece o pipeline Whisper no worker (download dos pesos + warm-up).
 * "Sempre rodando": o worker e o pipeline ficam vivos na sessão inteira.
 */
export function initWhisper(
  onProgress?: (text: string) => void,
): Promise<void> {
  if (!isWhisperSupported()) return Promise.reject(new Error("Whisper unsupported"));
  progressCallback = onProgress ?? null;
  initPromise ??= new Promise<void>((resolve, reject) => {
    const w = ensureWorker();
    const prev = w.onmessage;
    w.onmessage = (event: MessageEvent<WhisperWorkerResponse>) => {
      if (event.data.type === "ready") {
        w.onmessage = prev;
        // Restaura o handler padrão sem perder a mensagem ready.
        w.onmessage?.(event);
        resolve();
        return;
      }
      if (event.data.type === "error") {
        w.onmessage = prev;
        reject(new Error(event.data.message));
        return;
      }
      prev?.(event);
    };
    send({ type: "init" });
  });
  // Init falho não envenena o singleton — próxima chamada tenta de novo.
  initPromise.catch(() => {
    initPromise = null;
  });
  return initPromise;
}

/** Transcreve PCM mono 16kHz; inicia o pipeline sob demanda se preciso. */
export async function transcribeAudio(samples: Float32Array): Promise<string> {
  await initWhisper();
  const id = nextId++;
  const result = new Promise<string>((resolve, reject) => {
    pending.set(id, { resolve, reject });
  });
  send({ type: "transcribe", id, samples }, [samples.buffer]);
  return result;
}

/** Testes/teardown — descarrega o worker e o pipeline. */
export function resetWhisper(): void {
  pending.clear();
  initPromise = null;
  progressCallback = null;
  worker?.terminate();
  worker = null;
}
