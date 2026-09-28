// Substitui placeholders "{key}" em templates do dicionário.
// format("Practice {date}", { date: "28/09" }) → "Practice 28/09"
export function format(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (raw, key: string) =>
    key in params ? String(params[key]) : raw,
  );
}
