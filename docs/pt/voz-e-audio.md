# Voz e áudio

O módulo de voz permite que o usuário fale com o aplicativo e escute as respostas no sotaque escolhido. A captura de áudio é feita com a **Web Speech API** e gerenciada por um temporizador de inatividade.

## Funcionalidades

- **Entrada de voz** (`SpeechRecognition`): transcreve o que o usuário fala.
- **Saída de voz** (`SpeechSynthesis`): lê as respostas do professor em voz alta.
- **Sotaque do TTS**: configurado para `en-US` ou `en-GB` de acordo com o perfil do usuário.

## Fluxo de gravação

```
[ Início da gravação ]
          │
          ├──► Usuário clica para parar ──► [ Encerra e processa ]
          │
          └──► Escuta ativa (temporizador: 10s)
                     │
                     ├── Ocorreu fala? SIM ──► (Reseta o temporizador para 10s)
                     │
                     └── Nenhuma fala por 10s ──► [ Encerra e processa ]
```

## Regras de encerramento

A gravação só para quando:

1. O usuário clica novamente no botão de microfone.
2. Passam **10 segundos consecutivos** sem detectar nova fala.

Quando uma nova fala é detectada, o temporizador é reiniciado.

## Exemplo de uso da API

```ts
const recognition = new (
  window.SpeechRecognition || window.webkitSpeechRecognition
)();
recognition.lang = "en-US";
recognition.continuous = true;
recognition.interimResults = false;

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript;
  // Envia o texto para o engine de conversação
};

recognition.onend = () => {
  // Decide se reinicia ou processa
};

recognition.start();
```

```ts
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = "en-US"; // ou "en-GB"
window.speechSynthesis.speak(utterance);
```

## Fallback Whisper on-device

`createSTT()` (`src/lib/speech.ts`) escolhe o engine de transcrição:

1. **`SpeechRecognition`** (Web Speech API) — padrão quando existe.
2. **`WhisperRecognition`** (`src/lib/stt/`) — fallback on-device para webviews sem suporte (Tauri/WebKitGTK, Firefox, parte do mobile).

O fallback roda `Xenova/whisper-tiny` via `@huggingface/transformers` num **Web Worker dedicado** (`src/lib/stt/whisper.worker.ts`), mantido quente durante toda a sessão ("sempre rodando" — o pipeline não é descarregado). O `ModelPreloader` também pré-aquece o Whisper ao abrir o app quando `SpeechRecognition` não existe.

- **Pesos**: servidos de `/models/Xenova/whisper-tiny` quando `npm run download-models` já baixou o corpus (probe em `config.json`); senão, do Hugging Face com cache do transformers.js.
- **Fluxo**: `MediaRecorder` captura o áudio e um `AnalyserNode` mede o nível RMS — ~2s de silêncio após fala finaliza a transcrição (o timer externo de 10s segue como teto). Cada fala emite um resultado `isFinal` — não há resultados parciais (interim) como na Web Speech API.
- **Requisitos**: `getUserMedia` + WebAssembly + Worker; sem eles a UI mostra "não suportado".

## Considerações

- Nem todos os navegadores suportam `SpeechRecognition` nativamente. No Chrome/Edge desktop e Android, geralmente funciona — os demais caem no Whisper local.
- Para melhor experiência, o TTS deve respeitar o sotaque configurado na persona.
- O processamento de áudio nunca deve bloquear a thread principal.

## Veja também

- [Pedagogia e prompts](pedagogia-e-prompts.md)
- [Visão geral da arquitetura](arquitetura.md)
