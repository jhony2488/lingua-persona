"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquarePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api-client";
import { useSettings } from "@/lib/store/settings";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({
  selectedId,
  onSelect,
}: ConversationListProps) {
  const userId = useSettings((state) => state.userId);
  const dialect = useSettings((state) => state.dialect);
  const level = useSettings((state) => state.level);
  const queryClient = useQueryClient();

  const { data: conversations = [], isPending } = useQuery({
    queryKey: ["conversations", userId],
    queryFn: () => api.listConversations(userId ?? undefined),
    enabled: Boolean(userId),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.createConversation({
        userId: userId ?? "",
        title: `Practice ${new Date().toLocaleDateString()}`,
        dialect,
        level,
      }),
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      onSelect(conversation.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteConversation(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });

  return (
    <div className="flex w-full flex-col gap-2 md:w-64">
      <Button
        variant="outline"
        className="justify-start gap-2"
        onClick={() => createMutation.mutate()}
        disabled={!userId || createMutation.isPending}
      >
        <MessageSquarePlus className="size-4" />
        New conversation
      </Button>
      <ScrollArea className="max-h-[60vh]">
        <ul className="flex flex-col gap-1">
          {isPending && (
            <li className="text-muted-foreground p-2 text-sm">Loading…</li>
          )}
          {!isPending && conversations.length === 0 && (
            <li className="text-muted-foreground p-2 text-sm">
              No conversations yet.
            </li>
          )}
          {conversations.map((conversation) => (
            <li key={conversation.id} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  "hover:bg-accent flex-1 truncate rounded-md px-3 py-2 text-left text-sm",
                  selectedId === conversation.id && "bg-accent",
                )}
              >
                {conversation.title ?? "Untitled"}
                <span className="text-muted-foreground ml-2 text-xs">
                  {conversation.level}
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                className="invisible size-7 group-hover:visible"
                onClick={() => deleteMutation.mutate(conversation.id)}
                aria-label="Delete conversation"
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
