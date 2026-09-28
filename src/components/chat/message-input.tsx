"use client";

import { SendHorizonal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VoiceButton } from "@/components/chat/voice-button";
import { useDict } from "@/i18n/provider";
import type { Dialect } from "@/lib/store/settings";

interface MessageInputProps {
  dialect: Dialect;
  disabled?: boolean;
  pending?: boolean;
  onSend: (content: string) => void;
}

export function MessageInput({
  dialect,
  disabled,
  pending,
  onSend,
}: MessageInputProps) {
  const dict = useDict();
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const content = value.trim();
    if (!content || pending) return;
    onSend(content);
    setValue("");
    textareaRef.current?.focus();
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, [disabled]);

  return (
    <div className="flex items-end gap-2 border-t p-3">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={
          disabled
            ? dict.chat.selectConversationFirst
            : dict.chat.typeMessage
        }
        disabled={disabled}
        rows={2}
        className="resize-none"
      />
      <VoiceButton
        dialect={dialect}
        disabled={disabled}
        onTranscript={(text) =>
          setValue((prev) => (prev ? `${prev} ${text}` : text))
        }
      />
      <Button
        size="icon"
        onClick={submit}
        disabled={disabled || pending || !value.trim()}
        aria-label={dict.chat.sendMessage}
      >
        <SendHorizonal className="size-4" />
      </Button>
    </div>
  );
}
