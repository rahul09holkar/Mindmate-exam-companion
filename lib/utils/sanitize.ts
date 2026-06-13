/**
 * Defensive text sanitiser for user-generated content shown in the UI.
 *
 * React already escapes text nodes, so this is not the primary XSS defence —
 * it strips control characters and collapses excess whitespace so displayed
 * content stays clean and predictable. Never render user content via
 * dangerouslySetInnerHTML.
 */
export function sanitizeText(input: string): string {
  return input
    // Strip ASCII control chars, keeping tab (\x09) and newline (\x0A).
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Collapse long runs of spaces/tabs.
    .replace(/[ \t]{3,}/g, "  ")
    .trim();
}
