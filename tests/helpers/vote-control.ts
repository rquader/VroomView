import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { jsx, jsxs } from "react/jsx-runtime";
import ts from "typescript";

type VoteState = { score: number; viewerVote: -1 | 0 | 1 };

/** Execute the real client handler/reducer while replacing framework/network edges. */
export async function loadVoteControl() {
  let reducer: (state: VoteState, action: unknown) => VoteState;
  let optimisticAction: unknown;
  let transition: Promise<void> | undefined;
  const path = fileURLToPath(
    new URL("../../components/concepts/VoteControl.tsx", import.meta.url),
  );
  const source = (await readFile(path, "utf8"))
    .replace(
      'import { useOptimistic, useState, useTransition } from "react";',
      "const { useOptimistic, useState, useTransition } = globalThis.__voteControlTest;",
    )
    .replace(
      'import { usePathname, useRouter } from "next/navigation";',
      "const { usePathname, useRouter } = globalThis.__voteControlTest;",
    )
    .replace(
      'import { ROUTES } from "@/constants/app";',
      'const ROUTES = { login: "/login", concept: (id) => `/concepts/${id}` };',
    )
    .replace(
      'import { setCommentVote, setConceptVote } from "@/lib/actions/engagement";',
      "const { setCommentVote, setConceptVote } = globalThis.__voteControlTest;",
    )
    .replace(
      /import \{[\s\S]*?\} from "@\/components\/ui\/Icon";/,
      "const CheckIcon = () => null, ChevronDownIcon = () => null, ChevronUpIcon = () => null;",
    );
  (
    globalThis as typeof globalThis & { __voteControlTest: unknown }
  ).__voteControlTest = {
    jsx,
    jsxs,
    useState: (value: unknown) => [value, () => undefined],
    useTransition: () => [
      false,
      (work: () => Promise<void>) => (transition = work()),
    ],
    useOptimistic: (state: VoteState, update: typeof reducer) => {
      reducer = update;
      return [state, (action: unknown) => (optimisticAction = action)];
    },
    useRouter: () => ({ push: () => undefined }),
    usePathname: () => "/concepts/example",
    setConceptVote: async () => ({ ok: true }),
    setCommentVote: async () => ({ ok: true }),
  };
  const compiled = ts
    .transpileModule(source, {
      fileName: path,
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    })
    .outputText.replace(
      /import \{([^}]+)\} from "react\/jsx-runtime";/,
      (_match, imports: string) =>
        `const { ${imports.replaceAll(" as ", ": ")} } = globalThis.__voteControlTest;`,
    );
  const component = await import(
    `data:text/javascript,${encodeURIComponent(compiled)}#${Date.now()}`
  );
  return {
    async press(state: VoteState, direction: 1 | -1) {
      const tree = component.VoteControl({
        conceptId: "example",
        ...state,
        signedIn: true,
      });
      const buttons = tree.props.children[0].props.children;
      buttons[direction === 1 ? 0 : 2].props.onClick();
      await transition;
    },
    rebase: (state: VoteState) => reducer(state, optimisticAction),
  };
}
