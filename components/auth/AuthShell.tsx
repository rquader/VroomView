import type { ReactNode } from "react";

/**
 * The credentials sheet: every auth page is a narrow title-block card so
 * signing in feels like the rest of the drafting room, not a bolt-on.
 */
export function AuthShell({
  kicker,
  title,
  lede,
  children,
  footer,
}: {
  kicker: string;
  title: string;
  lede?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-5 py-12">
      <div className="sheet overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-line bg-well/60 px-5 py-2.5">
          <span className="ui-label text-accent">{kicker}</span>
          <span className="dateline text-ink-2">VroomView</span>
        </div>
        <div className="px-5 py-6 sm:px-6">
          <h1 className="font-serif text-3xl font-medium tracking-[-0.02em]">
            {title}
          </h1>
          {lede ? (
            <p className="mt-2 text-sm leading-relaxed text-ink-2">{lede}</p>
          ) : null}
          <div className="mt-6">{children}</div>
        </div>
      </div>
      {footer ? (
        <div className="mt-4 text-center text-sm text-ink-2">{footer}</div>
      ) : null}
    </main>
  );
}

export default AuthShell;
