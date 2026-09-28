"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ConversationList } from "@/components/chat/conversation-list";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { OnboardingDialog } from "@/components/chat/onboarding-dialog";
import { TopicChips } from "@/components/chat/topic-chips";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { useSettings } from "@/lib/store/settings";

export default function ChatPage() {
  const userId = useSettings((state) => state.userId);
  const dialect = useSettings((state) => state.dialect);
  const level = useSettings((state) => state.level);
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
        title: `Talk about: ${topic}`,
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
          {!selectedId ? (
            <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-4 p-6 text-sm">
              <p>Pick a conversation or create a new one.</p>
              {userId && (
                <TopicChips
                  conversations={conversations}
                  onSelect={(topic) => topicMutation.mutate(topic)}
                />
              )}
            </div>
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
