/**
 * Route-level skeleton for the catalogue: ghost shelves where the body-style
 * plates will land. Mirrors the real grid so the swap-in doesn't jump.
 */
export default function LoadingExplore() {
  return (
    <main
      className="mx-auto max-w-6xl animate-pulse px-5 py-10 sm:px-8 sm:py-14"
      aria-busy="true"
      aria-label="Opening the catalogue"
    >
      <div className="h-3 w-32 rounded bg-well" />
      <div className="mt-4 h-9 w-64 rounded bg-well" />
      <div className="mt-4 h-4 w-full max-w-xl rounded bg-well" />

      <div className="mt-12 h-3 w-28 rounded bg-well" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="sheet p-5">
            <div className="h-24 rounded-[8px] border border-line bg-well/60" />
            <div className="mt-4 flex items-baseline justify-between">
              <div className="h-5 w-24 rounded bg-well" />
              <div className="h-3 w-16 rounded bg-well" />
            </div>
            <div className="mt-4 h-3 w-28 rounded bg-well" />
            <div className="mt-2 h-4 w-4/5 rounded bg-well" />
          </div>
        ))}
      </div>
      <span className="sr-only">Opening the catalogue…</span>
    </main>
  );
}
