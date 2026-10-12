"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDict } from "@/i18n/provider";
import { api } from "@/lib/api-client";
import { useSettings } from "@/lib/store/settings";

export function OnboardingDialog({ open }: { open: boolean }) {
  const dict = useDict();
  const setUserId = useSettings((state) => state.setUserId);
  const setDialect = useSettings((state) => state.setDialect);
  const setLevel = useSettings((state) => state.setLevel);
  const dialect = useSettings((state) => state.dialect);
  const level = useSettings((state) => state.level);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [needsName, setNeedsName] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!needsName) {
        const existingUser = await api.findUserByEmail(email);
        if (existingUser) return existingUser;
        setNeedsName(true);
        return null;
      }
      return api.createUser({
        name,
        email,
        englishLevel: level,
        preferredDialect: dialect,
      });
    },
    onSuccess: (user) => {
      if (!user) return;
      setUserId(user.id);
      setDialect(user.preferredDialect as "US" | "UK");
      setLevel(user.englishLevel as "A1" | "A2" | "B1" | "B2" | "C1" | "C2");
    },
  });

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{dict.onboarding.title}</DialogTitle>
          <DialogDescription>{dict.onboarding.description}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <Input
            type="email"
            placeholder={dict.onboarding.emailPlaceholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {needsName && (
            <Input
              placeholder={dict.onboarding.namePlaceholder}
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoFocus
            />
          )}
          {mutation.isError && (
            <p className="text-destructive text-sm">{dict.onboarding.error}</p>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? dict.onboarding.saving
              : needsName
                ? dict.onboarding.start
                : dict.onboarding.continue}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
