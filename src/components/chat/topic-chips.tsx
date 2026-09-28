"use client";

import type { Conversation } from "@prisma/client";
import { useDict } from "@/i18n/provider";
import { useSettings } from "@/lib/store/settings";
import { topicsForLevel } from "@/modules/study/topics.data";

export function TopicChips({
  conversations,
  onSelect,
}: {
  conversations: Conversation[];
  onSelect: (topic: string) => void;
}) {
  const dict = useDict();
  const level = useSettings((s) => s.level);
  const used = new Set(conversations.map((c) => (c.title ?? "").toLowerCase()));

  const suggestions = topicsForLevel(level)
    .filter((t) => !used.has(t.theme.toLowerCase()))
    .slice(0, 6);

  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-xs">
        {dict.chat.talkAbout}
      </span>
      {suggestions.map((topic) => (
        <button
          key={topic.theme}
          type="button"
          onClick={() => onSelect(topic.theme)}
          className="bg-muted hover:bg-accent rounded-full border px-3 py-1 text-xs transition-colors"
        >
          {topic.theme}
        </button>
      ))}
    </div>
  );
}
