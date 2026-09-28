"use client";

import { Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Dialect } from "@/lib/store/settings";

interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: SpeechRecognitionResultItem }>;
}

interface SpeechRecognitionLike {
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

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

const SILENCE_TIMEOUT_MS = 10_000;

interface VoiceButtonProps {
  dialect: Dialect;
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export function VoiceButton({
  dialect,
  onTranscript,
  disabled,
}: VoiceButtonProps) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = null;
    recognitionRef.current?.stop();
    setListening(false);
  };

  const armSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(stop, SILENCE_TIMEOUT_MS);
  };

  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      recognitionRef.current?.stop();
    };
  }, []);

  const toggle = () => {
    if (listening) {
      stop();
      return;
    }

    const recognition = getRecognition();
    if (!recognition) {
      setSupported(false);
      return;
    }

    recognition.lang = dialect === "UK" ? "en-GB" : "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      armSilenceTimer();
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (text) onTranscript(text);
        }
      }
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    armSilenceTimer();
    setListening(true);
  };

  if (!supported) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        title="Speech recognition not supported"
      >
        <MicOff className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={listening ? "destructive" : "outline"}
      size="icon"
      onClick={toggle}
      disabled={disabled}
      title={listening ? "Stop listening" : "Start voice input"}
      aria-pressed={listening}
    >
      <Mic className="size-4" />
    </Button>
  );
}
