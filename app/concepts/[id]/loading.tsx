/**
 * Route-level skeleton for a concept page: the drawing sheet being set up —
 * ghost bars where the register, title, elevation, and spec band will land.
 * Mirrors the real page's anatomy so the swap-in doesn't jump. The pulse is a
 * transition-level animation, so reduced-motion collapses it to static.
 */
export default function LoadingConcept() {
  return (
    <main
      className="mx-auto max-w-6xl animate-pulse px-5 py-10 sm:px-8"
      aria-busy="true"
      aria-label="Pulling this sheet"
    >
      <div className="h-4 w-16 rounded bg-well" />

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_264px] lg:gap-16">
        <div>
          <div className="sheet overflow-hidden">
            <div className="flex items-center justify-between border-b border-line bg-well/60 px-5 py-3 sm:px-7">
              <div className="h-3 w-40 rounded bg-well" />
              <div className="h-3 w-24 rounded bg-well" />
            </div>
            <div className="grid gap-7 px-5 pt-6 pb-7 sm:px-7 sm:pt-8 lg:grid-cols-[minmax(0,1fr)_290px] lg:items-center lg:gap-10">
              <div>
                <div className="h-9 w-4/5 rounded bg-well" />
                <div className="mt-3 h-9 w-3/5 rounded bg-well" />
                <div className="mt-5 h-4 w-full rounded bg-well" />
                <div className="mt-2 h-4 w-11/12 rounded bg-well" />
              </div>
              <div className="lg:border-l lg:border-line lg:pl-10">
                <div className="mx-auto h-24 w-full max-w-[260px] rounded bg-well/70 lg:max-w-none" />
                <div className="dim-rule mx-auto mt-3 max-w-[260px] lg:max-w-none" />
                <div className="mx-auto mt-2 h-3 w-28 rounded bg-well" />
              </div>
            </div>
            <div className="border-t border-line bg-well/40 px-5 py-6 sm:px-7">
              <div className="h-3 w-44 rounded bg-well" />
              <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-2.5 w-16 rounded bg-well" />
                    <div className="mt-2 h-6 w-24 rounded bg-well" />
                    <div className="dim-rule mt-2.5" />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-line px-5 py-4 sm:px-7">
              <div className="h-3 w-48 rounded bg-well" />
              <div className="h-11 w-44 rounded-btn bg-well" />
            </div>
          </div>

          <div className="mt-12 max-w-3xl">
            <div className="h-7 w-44 rounded bg-well" />
            {[0, 1].map((i) => (
              <div key={i} className="sheet mt-4 p-4">
                <div className="h-3 w-32 rounded bg-well" />
                <div className="mt-3 h-4 w-full rounded bg-well" />
                <div className="mt-2 h-4 w-2/3 rounded bg-well" />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block">
          <div className="h-3 w-28 rounded bg-well" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="mt-4 flex items-center justify-between">
              <div className="h-3 w-16 rounded bg-well" />
              <div className="h-3 w-24 rounded bg-well" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Pulling this sheet…</span>
    </main>
  );
}
