"use client";

import type { Message } from "@prisma/client";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Dialect } from "@/lib/store/settings";
import { cn } from "@/lib/utils";

function speak(text: string, dialect: Dialect) {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = dialect === "UK" ? "en-GB" : "en-US";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

interface MessageListProps {
  messages: Message[];
  dialect: Dialect;
  pending?: boolean;
}

export function MessageList({ messages, dialect, pending }: MessageListProps) {
  if (messages.length === 0 && !pending) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
        Say hello to start practicing.
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <ul className="flex flex-col gap-3 p-1">
        {messages.map((message) => (
          <li
            key={message.id}
            className={cn(
              "flex max-w-[80%] items-start gap-2 rounded-lg px-4 py-2 text-sm",
              message.role === "user"
                ? "bg-primary text-primary-foreground self-end"
                : "bg-muted self-start",
            )}
          >
            <span className="whitespace-pre-wrap">{message.content}</span>
            {message.role === "assistant" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-6 shrink-0"
                onClick={() => speak(message.content, dialect)}
                aria-label="Play message"
              >
                <Volume2 className="size-3" />
              </Button>
            )}
          </li>
        ))}
        {pending && (
          <li className="bg-muted text-muted-foreground self-start rounded-lg px-4 py-2 text-sm">
            Teacher is typing…
          </li>
        )}
      </ul>
    </ScrollArea>
  );
}
