"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AudioLines, MessageSquare } from "lucide-react";
import { useState, type ComponentType } from "react";
import { ConversationList } from "@/components/chat/conversation-list";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { OnboardingDialog } from "@/components/chat/onboarding-dialog";
import { TopicChips } from "@/components/chat/topic-chips";
import { VoiceMode } from "@/components/chat/voice-mode";
import { Card } from "@/components/ui/card";
import { format } from "@/i18n/format";
import { useDict } from "@/i18n/provider";
import { api } from "@/lib/api-client";
import { useSettings, type ChatMode } from "@/lib/store/settings";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const dict = useDict();
  const userId = useSettings((state) => state.userId);
  const dialect = useSettings((state) => state.dialect);
  const level = useSettings((state) => state.level);
  const chatMode = useSettings((state) => state.chatMode);
  const setChatMode = useSettings((state) => state.setChatMode);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations", userId],
    queryFn: () => api.listConversations(userId ?? undefined),
    enabled: Boolean(userId),
  });

  const { data: messages = [], isPending: loadingMessages } = useQuery({
    queryKey: ["messages", selectedId],
    queryFn: () => api.listMessages(selectedId ?? ""),
    enabled: Boolean(selectedId),
  });

  const sendMutation = useMutation({
    mutationFn: (content: string) => api.sendMessage(selectedId ?? "", content),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["messages", selectedId] }),
  });

  const topicMutation = useMutation({
    mutationFn: (topic: string) =>
      api.createConversation({
        userId: userId ?? "",
        title: format(dict.chat.talkAboutTopic, { topic }),
        dialect,
        level,
      }),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedId(conversation.id);
    },
  });

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
      <OnboardingDialog open={!userId} />

      <div className="flex flex-col gap-4 md:flex-row">
        <ConversationList selectedId={selectedId} onSelect={setSelectedId} />

        <Card className="flex min-h-[60vh] flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-end border-b px-3 py-2">
            <ModeToggle mode={chatMode} onChange={setChatMode} />
          </div>

          {!selectedId && chatMode === "chat" ? (
            <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-4 p-6 text-sm">
              <p>{dict.chat.pickConversation}</p>
              {userId && (
                <TopicChips
                  conversations={conversations}
                  onSelect={(topic) => topicMutation.mutate(topic)}
                />
              )}
            </div>
          ) : chatMode === "voice" ? (
            <VoiceMode
              key={selectedId ?? "none"}
              selectedId={selectedId}
              messages={messages}
              conversations={conversations}
              pending={sendMutation.isPending}
              onSend={(content) => sendMutation.mutateAsync(content)}
              onSelectTopic={(topic) => topicMutation.mutate(topic)}
            />
          ) : (
            <>
              <MessageList
                messages={messages}
                dialect={dialect}
                pending={loadingMessages || sendMutation.isPending}
              />
              <MessageInput
                dialect={dialect}
                disabled={!userId}
                pending={sendMutation.isPending}
                onSend={(content) => sendMutation.mutate(content)}
              />
            </>
          )}
        </Card>
      </div>
    </main>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: ChatMode;
  onChange: (mode: ChatMode) => void;
}) {
  const dict = useDict();
  const options: {
    value: ChatMode;
    label: string;
    icon: ComponentType<{ className?: string }>;
  }[] = [
    { value: "voice", label: dict.voice.modeVoice, icon: AudioLines },
    { value: "chat", label: dict.voice.modeChat, icon: MessageSquare },
  ];
  return (
    <div className="flex rounded-md border text-xs">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={mode === option.value}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 transition-colors",
            mode === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent",
          )}
        >
          <option.icon className="size-3.5" />
          {option.label}
        </button>
      ))}
    </div>
  );
}
