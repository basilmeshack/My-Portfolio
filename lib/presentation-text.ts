/** Converts editor HTML/Markdown to safe plain text for text-only displays. */
export function toPlainText(value?: string | null): string {
  if (!value) return ""

  return value
    .replace(/<\/(p|div|h[1-6]|li|br)\s*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/!?(?:\[[^\]]*\])?\([^)]*\)/g, "")
    .replace(/(\*\*|__|\*|_|`|~~)/g, "")
    .replace(/^\s{0,3}[-*+]\s+/gm, "")
    .replace(/^\s{0,3}\d+[.)]\s+/gm, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim()
}
