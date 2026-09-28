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
import { api } from "@/lib/api-client";
import { useSettings } from "@/lib/store/settings";

export function OnboardingDialog({ open }: { open: boolean }) {
  const setUserId = useSettings((state) => state.setUserId);
  const dialect = useSettings((state) => state.dialect);
  const level = useSettings((state) => state.level);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api.createUser({
        name,
        email,
        englishLevel: level,
        preferredDialect: dialect,
      }),
    onSuccess: (user) => setUserId(user.id),
  });

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Welcome to LinguaPersona</DialogTitle>
          <DialogDescription>
            Tell us your name and email to start practicing. Your data stays on
            this device.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <Input
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {mutation.isError && (
            <p className="text-destructive text-sm">
              Could not create your profile. Try again.
            </p>
          )}
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Start"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
