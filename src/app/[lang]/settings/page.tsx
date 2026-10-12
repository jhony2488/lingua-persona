"use client";

import { useState, useSyncExternalStore } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "@/i18n/format";
import { useDict } from "@/i18n/provider";
import { api, type UpdateUserPayload } from "@/lib/api-client";
import {
  getNotificationPermission,
  requestNotificationPermission,
} from "@/lib/notifications";
import {
  useSettings,
  type AgentGender,
  type Dialect,
  type EnglishLevel,
} from "@/lib/store/settings";

const LEVELS: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function SettingsPage() {
  const dict = useDict();
  const {
    userId,
    dialect,
    level,
    agentName,
    agentGender,
    setDialect,
    setLevel,
    setAgentName,
    setAgentGender,
    setTourCompleted,
  } = useSettings();
  // true apenas no cliente — Notification.permission não existe no SSR e
  // lê-la no estado inicial causaria hydration mismatch.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [requested, setRequested] = useState<
    NotificationPermission | "unsupported" | null
  >(null);
  const saveMutation = useMutation({
    mutationFn: (payload: UpdateUserPayload) => {
      if (!userId) throw new Error("A profile must be selected first");
      return api.updateUser(userId, payload);
    },
  });
  const saveProfile = (payload: UpdateUserPayload) => {
    if (!userId) return;
    saveMutation.mutate(payload);
  };
  const permission =
    requested ?? (mounted ? getNotificationPermission() : "unsupported");

  const permissionLabel = {
    granted: dict.settings.permissionGranted,
    denied: dict.settings.permissionDenied,
    default: dict.settings.permissionDefault,
    unsupported: dict.settings.permissionUnsupported,
  }[permission];

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{dict.settings.title}</CardTitle>
          <CardDescription>{dict.settings.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            {dict.settings.teacherName}
            <Input
              value={agentName}
              onChange={(event) => {
                setAgentName(event.target.value);
                saveMutation.reset();
              }}
              onBlur={() => saveProfile({ agentName })}
              maxLength={40}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            {dict.settings.teacherVoice}
            <Select
              value={agentGender}
              onValueChange={(value) => {
                const nextValue = value as AgentGender;
                setAgentGender(nextValue);
                saveProfile({ agentGender: nextValue });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{dict.settings.voiceMale}</SelectItem>
                <SelectItem value="female">
                  {dict.settings.voiceFemale}
                </SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            {dict.settings.dialect}
            <Select
              value={dialect}
              onValueChange={(value) => {
                const nextValue = value as Dialect;
                setDialect(nextValue);
                saveProfile({ preferredDialect: nextValue });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">
                  {dict.settings.americanEnglish}
                </SelectItem>
                <SelectItem value="UK">
                  {dict.settings.britishEnglish}
                </SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            {dict.settings.yourLevel}
            <Select
              value={level}
              onValueChange={(value) => {
                const nextValue = value as EnglishLevel;
                setLevel(nextValue);
                saveProfile({ englishLevel: nextValue });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {userId &&
            (saveMutation.isPending ||
              saveMutation.isError ||
              saveMutation.isSuccess) && (
              <p
                className={
                  saveMutation.isError
                    ? "text-destructive text-sm"
                    : "text-muted-foreground text-sm"
                }
                role="status"
              >
                {saveMutation.isPending
                  ? dict.settings.profileSaving
                  : saveMutation.isError
                    ? dict.settings.profileSaveError
                    : dict.settings.profileSaved}
              </p>
            )}
          {!userId && (
            <p className="text-muted-foreground text-sm" role="status">
              {dict.settings.profileLocalOnly}
            </p>
          )}

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="text-sm font-medium">
                {dict.settings.notifications}
              </p>
              <p className="text-muted-foreground text-xs">
                {format(dict.settings.notificationsDescription, {
                  state: permissionLabel,
                })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={permission === "unsupported"}
              onClick={async () =>
                setRequested(await requestNotificationPermission())
              }
            >
              {dict.settings.enable}
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <p className="text-sm font-medium">{dict.tour.replayTitle}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTourCompleted(false)}
            >
              {dict.tour.replay}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
