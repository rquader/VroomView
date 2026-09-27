/** Initials are a predictable fallback until public profile pictures exist. */
export function Avatar({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-line bg-well font-serif font-medium text-ink ${small ? "h-8 w-8 text-base" : "h-10 w-10 text-xl"}`}
    >
      {name.trim().charAt(0).toUpperCase() || "V"}
    </span>
  );
}
