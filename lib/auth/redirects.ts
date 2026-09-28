/** URL parsers normalize backslashes and control characters before redirecting. */
export function safeAuthNext(raw: unknown): string {
  if (
    typeof raw !== "string" ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    /[\\\u0000-\u001f\u007f]/.test(raw)
  ) {
    return "/";
  }
  return raw;
}
