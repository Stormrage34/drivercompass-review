/**
 * Split a comma-separated form value into trimmed, non-empty items.
 * Form inputs submit `""` for empty lists, so null/undefined are treated the same.
 */
export function splitCsv(value: string | null | undefined): string[] {
  return value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
}
