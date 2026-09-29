# Voice and audio

The voice module lets the user talk to the app and listen to responses in the chosen accent. Audio capture uses the **Web Speech API** and is managed by an inactivity timer.

## Features

- **Voice input** (`SpeechRecognition`): transcribes what the user says.
- **Voice output** (`SpeechSynthesis`): reads the teacher's responses aloud.
- **TTS accent**: configured to `en-US` or `en-GB` according to the user's profile.

## Recording flow

```
[ Start recording ]
          │
          ├──► User clicks stop ──► [ End and process ]
          │
          └──► Active listening (timer: 10s)
                     │
                     ├── Speech detected? YES ──► (Reset timer to 10s)
                     │
                     └── No speech for 10s ──► [ End and process ]
```

## Stop rules

Recording stops only when:

1. The user clicks the microphone button again.
2. **10 consecutive seconds** pass without detecting new speech.

When new speech is detected, the timer resets.

## API example

```ts
const recognition = new (
  window.SpeechRecognition || window.webkitSpeechRecognition
)();
recognition.lang = "en-US";
recognition.continuous = true;
recognition.interimResults = false;

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript;
  // Send text to conversation engine
};

recognition.onend = () => {
  // Decide whether to restart or process
};

recognition.start();
```

```ts
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = "en-US"; // or "en-GB"
window.speechSynthesis.speak(utterance);
```

## On-device Whisper fallback

`createSTT()` (`src/lib/speech.ts`) picks the transcription engine:

1. **`SpeechRecognition`** (Web Speech API) — default when present.
2. **`WhisperRecognition`** (`src/lib/stt/`) — on-device fallback for webviews without it (Tauri/WebKitGTK, Firefox, some mobile).

The fallback runs `Xenova/whisper-tiny` via `@huggingface/transformers` in a **dedicated Web Worker** (`src/lib/stt/whisper.worker.ts`), kept warm for the whole session ("always running" — the pipeline is never unloaded). `ModelPreloader` also pre-warms Whisper at page open when `SpeechRecognition` is missing.

- **Weights**: served from `/models/Xenova/whisper-tiny` when `npm run download-models` fetched them (probed via `config.json`); otherwise Hugging Face with the transformers.js cache.
- **Flow**: `MediaRecorder` captures audio while an `AnalyserNode` tracks the RMS level — ~2s of silence after speech finalizes the transcription (the outer 10s timer stays as a ceiling). Each utterance emits one `isFinal` result — there are no interim (partial) results like the Web Speech API.
- **Requirements**: `getUserMedia` + WebAssembly + Worker; without them the UI shows "not supported".

## Considerations

- Not all browsers support `SpeechRecognition` natively. It usually works on Chrome/Edge desktop and Android — everything else falls back to local Whisper.
- TTS should respect the accent configured in the persona.
- Audio processing must never block the main thread.

## See also

- [Pedagogy and prompts](pedagogy-and-prompts.md)
- [Architecture overview](architecture.md)
