"use client";

import { useSyncExternalStore } from "react";

// A no-op store: the value never changes after mount, so we never need to notify.
const subscribe = () => () => {};

/**
 * Returns `false` during server render and the first client (hydration) render,
 * then `true` once mounted on the client.
 *
 * Implemented with useSyncExternalStore (server snapshot = false, client = true)
 * rather than setState-in-useEffect — this is hydration-safe AND satisfies the
 * `react-hooks/set-state-in-effect` lint rule. Use it to gate browser-only UI.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // client snapshot
    () => false, // server snapshot
  );
}
