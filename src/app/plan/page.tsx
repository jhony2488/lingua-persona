"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { StudyPlan } from "@prisma/client";
import { api } from "@/lib/api-client";
import { useSettings } from "@/lib/store/settings";
import { buttonVariants } from "@/components/ui/button";
import type { PlanJson, WeekPlan } from "@/modules/study/plan-generator";

function WeekCard({ week }: { week: WeekPlan }) {
  return (
    <li className="bg-card rounded-lg border p-4">
      <h3 className="font-semibold">
        Week {week.week}: {week.theme}
      </h3>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {week.topics.map((topic) => (
          <span
            key={topic}
            className="bg-muted rounded-full border px-2 py-0.5 text-xs"
          >
            {topic}
          </span>
        ))}
      </div>
      <ul className="text-muted-foreground mt-3 list-disc space-y-1 pl-5 text-sm">
        {week.study.map((item) => (
          <li key={item.slug}>Study: {item.title}</li>
        ))}
        {week.reading && <li>Reading: {week.reading.title}</li>}
        {week.goals.map((goal) => (
          <li key={goal}>{goal}</li>
        ))}
      </ul>
    </li>
  );
}

function PlanCard({ plan }: { plan: StudyPlan }) {
  const planJson = JSON.parse(plan.planJson) as PlanJson;
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">{planJson.summary}</h2>
        <p className="text-muted-foreground text-xs">
          Level {plan.level} · created{" "}
          {new Date(plan.createdAt).toLocaleDateString()}
        </p>
      </div>
      <ol className="grid gap-3 sm:grid-cols-2">
        {planJson.weeks.map((week) => (
          <WeekCard key={week.week} week={week} />
        ))}
      </ol>
    </section>
  );
}

export default function PlanPage() {
  const userId = useSettings((s) => s.userId);
  const queryClient = useQueryClient();
  const [weeks, setWeeks] = useState(4);
  const [focus, setFocus] = useState<"grammar" | "speaking" | "balanced">(
    "balanced",
  );

  const plansQuery = useQuery({
    queryKey: ["study-plans", userId],
    queryFn: () => api.listStudyPlans(userId ?? undefined),
    enabled: Boolean(userId),
  });

  const generateMutation = useMutation({
    mutationFn: () => api.generateStudyPlan({ userId: userId!, weeks, focus }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["study-plans", userId] }),
  });

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Study plan</h1>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          ← Home
        </Link>
      </div>

      {!userId ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Create your teacher profile first to generate a study plan.
          </p>
          <Link href="/chat" className={buttonVariants({ className: "mt-4" })}>
            Go to chat
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <form
            className="bg-card flex flex-wrap items-end gap-3 rounded-lg border p-4"
            onSubmit={(event) => {
              event.preventDefault();
              generateMutation.mutate();
            }}
          >
            <label className="grid gap-1 text-sm">
              Weeks
              <select
                className="bg-background rounded-md border px-2 py-1"
                value={weeks}
                onChange={(event) => setWeeks(Number(event.target.value))}
              >
                {[2, 4, 6, 8, 12].map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Focus
              <select
                className="bg-background rounded-md border px-2 py-1"
                value={focus}
                onChange={(event) =>
                  setFocus(
                    event.target.value as "grammar" | "speaking" | "balanced",
                  )
                }
              >
                <option value="balanced">Balanced</option>
                <option value="grammar">Grammar</option>
                <option value="speaking">Speaking</option>
              </select>
            </label>
            <button
              type="submit"
              className={buttonVariants()}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? "Generating…" : "Generate plan"}
            </button>
            {generateMutation.isError && (
              <p className="text-destructive text-sm">
                {generateMutation.error.message}
              </p>
            )}
          </form>

          {plansQuery.isLoading && (
            <p className="text-muted-foreground">Loading plans…</p>
          )}
          {plansQuery.data?.length === 0 && (
            <p className="text-muted-foreground">
              No study plans yet — generate your first one above.
            </p>
          )}
          {plansQuery.data?.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </main>
  );
}
