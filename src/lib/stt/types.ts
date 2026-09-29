export type WhisperWorkerRequest =
  { type: "init" } | { type: "transcribe"; id: number; samples: Float32Array };

export type WhisperWorkerResponse =
  | { type: "progress"; text: string }
  | { type: "ready" }
  | { type: "result"; id: number; text: string }
  | { type: "error"; id?: number; message: string };
