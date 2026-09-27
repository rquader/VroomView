import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export type ConceptsActionMock = {
  inserted: unknown[];
  revalidated: string[];
};

export function createConceptsActionMock(userId: string | null = "viewer") {
  const mock: ConceptsActionMock = { inserted: [], revalidated: [] };
  return {
    mock,
    client: {
      auth: {
        getUser: async () => ({
          data: { user: userId ? { id: userId } : null },
        }),
      },
      from(table: string) {
        if (table !== "concepts") throw new Error(`Unexpected table: ${table}`);
        return {
          insert(payload: unknown) {
            mock.inserted.push(payload);
            return {
              select() {
                return {
                  single: async () => ({
                    data: { id: "concept-a" },
                    error: null,
                  }),
                };
              },
            };
          },
        };
      },
    },
  };
}

/** Loads the real action with only the framework and database seams replaced. */
export async function loadConceptActions(
  client: unknown,
  revalidated: string[],
) {
  const path = fileURLToPath(
    new URL("../../lib/actions/concepts.ts", import.meta.url),
  );
  const source = await readFile(path, "utf8");
  const injected = source
    .replace(
      'import { revalidatePath } from "next/cache";',
      "const { revalidatePath } = globalThis.__conceptActionTest;",
    )
    .replace(
      'import { createClient } from "@/lib/supabase/server";',
      "const { createClient } = globalThis.__conceptActionTest;",
    )
    .replace(
      'import { ALL_TAGS } from "@/constants/lenses";',
      'const ALL_TAGS = ["Design", "Safety"];',
    );
  (
    globalThis as typeof globalThis & { __conceptActionTest: unknown }
  ).__conceptActionTest = {
    createClient: async () => client,
    revalidatePath: (path: string) => revalidated.push(path),
  };
  const compiled = ts.transpileModule(injected, {
    fileName: path,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return import(
    `data:text/javascript,${encodeURIComponent(compiled.outputText)}#${Date.now()}`
  );
}
