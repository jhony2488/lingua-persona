import { AppError } from "@/lib/errors";

export async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new AppError(
      `External request failed with status ${res.status}`,
      502,
      "INTERNAL_ERROR",
    );
  }
  return (await res.json()) as T;
}
