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
  const {
    dialect,
    level,
    agentName,
    agentGender,
    setDialect,
    setLevel,
    setAgentName,
    setAgentGender,
  } = useSettings();
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => getNotificationPermission());

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Teacher settings</CardTitle>
          <CardDescription>
            Personalize how your virtual teacher talks and teaches.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Teacher name
            <Input
              value={agentName}
              onChange={(event) => setAgentName(event.target.value)}
              maxLength={40}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Teacher voice
            <Select
              value={agentGender}
              onValueChange={(value) => setAgentGender(value as AgentGender)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male (Alex)</SelectItem>
                <SelectItem value="female">Female (Alexia)</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Dialect
            <Select
              value={dialect}
              onValueChange={(value) => setDialect(value as Dialect)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">American English</SelectItem>
                <SelectItem value="UK">British English</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Your level
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
              <p className="text-sm font-medium">Notifications</p>
              <p className="text-muted-foreground text-xs">
                Web Push support is prepared; permission state: {permission}
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
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
