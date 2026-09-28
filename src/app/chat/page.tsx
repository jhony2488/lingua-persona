"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ConversationList } from "@/components/chat/conversation-list";
import { MessageInput } from "@/components/chat/message-input";
import { MessageList } from "@/components/chat/message-list";
import { OnboardingDialog } from "@/components/chat/onboarding-dialog";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api-client";
import { useSettings } from "@/lib/store/settings";

export default function ChatPage() {
  const userId = useSettings((state) => state.userId);
  const dialect = useSettings((state) => state.dialect);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

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

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
      <OnboardingDialog open={!userId} />

      <div className="flex flex-col gap-4 md:flex-row">
        <ConversationList selectedId={selectedId} onSelect={setSelectedId} />

        <Card className="flex min-h-[60vh] flex-1 flex-col overflow-hidden">
          {!selectedId ? (
            <div className="text-muted-foreground flex flex-1 items-center justify-center p-6 text-sm">
              Pick a conversation or create a new one.
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
