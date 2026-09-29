/// <reference lib="webworker" />
import type {
  WhisperWorkerRequest,
  WhisperWorkerResponse,
} from "@/lib/stt/types";

declare const self: DedicatedWorkerGlobalScope;

const MODEL_ID = "Xenova/whisper-tiny";

type Transcriber = (
  audio: Float32Array,
  options: Record<string, unknown>,
) => Promise<{ text: string } | { text: string }[]>;

type PipelineFactory = (
  task: string,
  model: string,
  options: Record<string, unknown>,
) => Promise<Transcriber>;

let transcriberPromise: Promise<Transcriber> | null = null;

function post(message: WhisperWorkerResponse) {
  self.postMessage(message);
}

/** Pesos self-host em /models/ (download-mlc-models) ou remoto no Hugging Face. */
async function resolveLocalModelPath(): Promise<string | null> {
  try {
    const res = await fetch(`/models/${MODEL_ID}/config.json`);
    return res.ok ? "/models/" : null;
  } catch {
    return null;
  }
}

async function initTranscriber(onProgress: (text: string) => void) {
  transcriberPromise ??= (async () => {
    const { pipeline, env } = await import("@huggingface/transformers");
    env.allowRemoteModels = true;
    const localPath = await resolveLocalModelPath();
    if (localPath) {
      env.localModelPath = localPath;
      env.allowLocalModels = true;
    }
    const device =
      typeof (self.navigator as { gpu?: unknown }).gpu !== "undefined"
        ? "webgpu"
        : "wasm";
    const create = pipeline as unknown as PipelineFactory;
    return create("automatic-speech-recognition", MODEL_ID, {
      device,
      dtype: "q8",
      progress_callback: (report: { status?: string; file?: string }) => {
        if (report.status === "progress" && report.file) {
          onProgress(report.file);
        }
      },
    });
  })();
  transcriberPromise.catch(() => {
    transcriberPromise = null;
  });
  return transcriberPromise;
}

async function warmup() {
  const transcriber = await initTranscriber(() => {});
  // Aquece o grafo com silêncio para a primeira transcrição real ser rápida.
  await transcriber(new Float32Array(16000), {
    language: "english",
    task: "transcribe",
  });
}

self.onmessage = async (event: MessageEvent<WhisperWorkerRequest>) => {
  const message = event.data;
  if (message.type === "init") {
    try {
      await initTranscriber((file) =>
        post({ type: "progress", text: file }),
      );
      await warmup();
      post({ type: "ready" });
    } catch (error) {
      post({ type: "error", message: String(error) });
    }
    return;
  }
  if (message.type === "transcribe") {
    try {
      const transcriber = await initTranscriber((file) =>
        post({ type: "progress", text: file }),
      );
      const output = await transcriber(message.samples, {
        language: "english",
        task: "transcribe",
      });
      const text = Array.isArray(output) ? (output[0]?.text ?? "") : output.text;
      post({ type: "result", id: message.id, text: text.trim() });
    } catch (error) {
      post({ type: "error", id: message.id, message: String(error) });
    }
  }
};
