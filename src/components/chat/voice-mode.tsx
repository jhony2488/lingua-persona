"use client";

import type { Conversation, Message } from "@prisma/client";
import {
  History,
  Mic,
  MicOff,
  SendHorizonal,
  Square,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TopicChips } from "@/components/chat/topic-chips";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import type { SendMessageResult } from "@/lib/api-client";
import {
  createSpeechRecognition,
  speak,
  speechLang,
  stopSpeaking,
  type SpeechRecognitionLike,
} from "@/lib/speech";
import { useSettings } from "@/lib/store/settings";
import { cn } from "@/lib/utils";

const SILENCE_TIMEOUT_MS = 10_000;

type VoiceStatus = "idle" | "listening" | "thinking" | "speaking" | "error";

const STATUS_LABEL: Record<VoiceStatus, string> = {
  idle: "Tap to talk",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  error: "Something went wrong",
};

interface VoiceModeProps {
  selectedId: string | null;
  messages: Message[];
  conversations: Conversation[];
  pending: boolean;
  onSend: (content: string) => Promise<SendMessageResult | void>;
  onSelectTopic: (topic: string) => void;
}

export function VoiceMode({
  selectedId,
  messages,
  conversations,
  pending,
  onSend,
  onSelectTopic,
}: VoiceModeProps) {
  const dialect = useSettings((s) => s.dialect);
  const agentName = useSettings((s) => s.agentName);
  const agentGender = useSettings((s) => s.agentGender);
  const voiceFlow = useSettings((s) => s.voiceFlow);
  const setVoiceFlow = useSettings((s) => s.setVoiceFlow);

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [supported, setSupported] = useState(true);
  const [interim, setInterim] = useState("");
  const [draft, setDraft] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionActiveRef = useRef(false);
  const statusRef = useRef<VoiceStatus>("idle");
  const voiceFlowRef = useRef(voiceFlow);

  useEffect(() => {
    voiceFlowRef.current = voiceFlow;
  }, [voiceFlow]);

  const setStatusSynced = (next: VoiceStatus) => {
    statusRef.current = next;
    setStatus(next);
  };

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
  };

  const stopListening = () => {
    clearSilenceTimer();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setInterim("");
    if (statusRef.current === "listening") setStatusSynced("idle");
  };

  const endSession = () => {
    sessionActiveRef.current = false;
    stopListening();
    stopSpeaking();
    setStatusSynced("idle");
  };

  const startListening = () => {
    const recognition = createSpeechRecognition();
    if (!recognition) {
      setSupported(false);
      return;
    }

    stopSpeaking();
    recognition.lang = speechLang(dialect);
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(
        () => stopListening(),
        SILENCE_TIMEOUT_MS,
      );

      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText += result[0].transcript;
        else interimText += result[0].transcript;
      }
      setInterim(interimText.trim());

      const text = finalText.trim();
      if (!text) return;
      if (voiceFlowRef.current === "auto") {
        if (statusRef.current !== "listening") return;
        void sendAndSpeak(text);
      } else {
        setDraft((prev) => (prev ? `${prev} ${text}` : text));
      }
    };
    recognition.onend = () => {
      if (statusRef.current === "listening") setStatusSynced("idle");
    };
    recognition.onerror = () => {
      if (statusRef.current === "listening") {
        setStatusSynced("error");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    silenceTimerRef.current = setTimeout(
      () => stopListening(),
      SILENCE_TIMEOUT_MS,
    );
    setStatusSynced("listening");
  };

  const sendAndSpeak = async (content: string) => {
    sessionActiveRef.current = true;
    stopListening();
    setDraft("");
    setStatusSynced("thinking");
    try {
      const result = await onSend(content);
      const reply = result?.assistantMessage?.content;
      if (!reply) {
        setStatusSynced("idle");
        return;
      }
      setStatusSynced("speaking");
      speak(reply, {
        dialect,
        gender: agentGender,
        onEnd: () => {
          setStatusSynced("idle");
          if (
            voiceFlowRef.current === "auto" &&
            sessionActiveRef.current
          ) {
            startListening();
          }
        },
      });
    } catch {
      setStatusSynced("error");
    }
  };

  const handleOrbPress = () => {
    if (status === "listening" || status === "speaking") {
      endSession();
      return;
    }
    if (status === "thinking") return;
    sessionActiveRef.current = true;
    startListening();
  };

  useEffect(() => {
    return () => {
      sessionActiveRef.current = false;
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
      stopSpeaking();
    };
  }, []);

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  if (!supported) {
    return (
      <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 p-6 text-sm">
        <MicOff className="size-8" />
        <p>Speech recognition is not supported in this browser.</p>
        <p className="text-xs">Switch to chat mode to keep practicing.</p>
      </div>
    );
  }

  if (!selectedId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <Orb status="idle" />
        <p className="text-muted-foreground text-sm">
          Pick a conversation topic and start talking with {agentName}.
        </p>
        <TopicChips conversations={conversations} onSelect={onSelectTopic} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {historyOpen && (
        <ScrollArea className="max-h-56 border-b">
          <ul className="flex flex-col gap-2 p-3">
            {messages.map((message) => (
              <li
                key={message.id}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-1.5 text-xs",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground self-end"
                    : "bg-muted self-start",
                )}
              >
                {message.content}
              </li>
            ))}
          </ul>
        </ScrollArea>
      )}

      <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6">
        <button
          type="button"
          onClick={handleOrbPress}
          disabled={status === "thinking"}
          aria-label={
            status === "listening" ? "Stop listening" : "Start talking"
          }
          className="rounded-full outline-none focus-visible:ring-4 focus-visible:ring-ring/50"
        >
          <Orb status={status} />
        </button>

        <p className="text-muted-foreground text-sm font-medium">
          {status === "error"
            ? "Could not reach the teacher. Tap to try again."
            : STATUS_LABEL[status]}
        </p>

        {(interim ||
          (status !== "listening" && (lastUser || lastAssistant))) && (
          <div className="flex max-w-md flex-col gap-1 text-center">
            {status === "listening" && interim ? (
              <p className="text-sm">{interim}</p>
            ) : (
              <>
                {lastUser && (
                  <p className="text-muted-foreground text-xs">
                    You: {lastUser.content}
                  </p>
                )}
                {lastAssistant && (
                  <p className="text-sm">
                    {agentName}: {lastAssistant.content}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {voiceFlow === "confirm" && status !== "listening" && (
          <div className="flex w-full max-w-md items-end gap-2">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Your speech appears here — edit and send."
              rows={2}
              className="resize-none text-sm"
            />
            <Button
              size="icon"
              onClick={() => {
                const content = draft.trim();
                if (content) void sendAndSpeak(content);
              }}
              disabled={!draft.trim() || pending}
              aria-label="Send message"
            >
              <SendHorizonal className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-3 py-2">
        <div className="flex rounded-md border text-xs">
          {(["auto", "confirm"] as const).map((flow) => (
            <button
              key={flow}
              type="button"
              onClick={() => setVoiceFlow(flow)}
              className={cn(
                "px-3 py-1.5 capitalize transition-colors",
                voiceFlow === flow
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              {flow === "auto" ? "Auto" : "Confirm"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {status !== "idle" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={endSession}
              aria-label="Stop session"
            >
              <Square className="size-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setHistoryOpen((open) => !open)}
            aria-label="Toggle transcript history"
            aria-expanded={historyOpen}
          >
            <History className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Orb({ status }: { status: VoiceStatus }) {
  return (
    <span className="relative flex size-32 items-center justify-center">
      {status === "listening" && (
        <>
          <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400/30" />
          <span
            className="absolute inset-0 animate-ping rounded-full bg-purple-400/20"
            style={{ animationDelay: "300ms" }}
          />
        </>
      )}
      {status === "speaking" && (
        <span className="absolute inset-0 animate-pulse rounded-full bg-indigo-400/30" />
      )}
      {status === "thinking" && (
        <span className="absolute -inset-1 animate-spin rounded-full border-2 border-transparent border-t-indigo-500" />
      )}
      <span
        className={cn(
          "flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg transition-transform",
          status === "listening" && "scale-105",
          status === "speaking" && "scale-110",
          status === "error" && "opacity-60",
        )}
      >
        {status === "listening" ? (
          <Mic className="size-8 text-white" />
        ) : status === "thinking" ? (
          <span className="size-3 animate-pulse rounded-full bg-white" />
        ) : (
          <Mic className="size-8 text-white/90" />
        )}
      </span>
    </span>
  );
}
