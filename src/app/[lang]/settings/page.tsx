"use client";

import { useState } from "react";
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
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => getNotificationPermission());

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
              onChange={(event) => setAgentName(event.target.value)}
              maxLength={40}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            {dict.settings.teacherVoice}
            <Select
              value={agentGender}
              onValueChange={(value) => setAgentGender(value as AgentGender)}
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
              onValueChange={(value) => setDialect(value as Dialect)}
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
              onValueChange={(value) => setLevel(value as EnglishLevel)}
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
                setPermission(await requestNotificationPermission())
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
