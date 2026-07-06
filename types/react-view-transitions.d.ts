import type { ReactNode } from "react";

/**
 * Type shim for React's <ViewTransition>, which EXISTS at runtime (Next 16
 * aliases `react` to its vendored 19.3 build, where the export was promoted
 * from unstable_ViewTransition) but is not yet declared by @types/react 19.2.
 * Minimal surface on purpose — just what the app uses. Delete this file once
 * @types/react catches up.
 */
declare module "react" {
  interface ViewTransitionProps {
    children?: ReactNode;
    /** stable identity for shared-element morphs across pages */
    name?: string;
    /** view-transition-class applied while entering/exiting/updating */
    enter?: string;
    exit?: string;
    update?: string;
    share?: string;
  }
  export function ViewTransition(props: ViewTransitionProps): ReactNode;
}
