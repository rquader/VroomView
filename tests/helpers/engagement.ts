import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";

type Response<T> = {
  data: T;
  error: { code?: string; message: string } | null;
};

export type EngagementMock = {
  revalidated: string[];
  writes: string[];
  scopes: { table: string; column: string; value: unknown }[];
  responses: {
    lookup?: Response<{ concept_id: string } | null>;
    update?: Response<{ id: string; concept_id: string } | null>;
    delete?: Response<{ id: string; concept_id: string } | null>;
    vote?: Response<null>;
  };
};

const ok = <T>(data: T): Response<T> => ({ data, error: null });

export function createEngagementMock(
  overrides: EngagementMock["responses"] = {},
) {
  const mock: EngagementMock = {
    revalidated: [],
    writes: [],
    scopes: [],
    responses: overrides,
  };
  const response = <T>(value: Response<T> | undefined, fallback: T) =>
    value ?? ok(fallback);
  const scope = (table: string, column: string, value: unknown) =>
    mock.scopes.push({ table, column, value });
  const comments = {
    select() {
      return {
        eq(column: string, value: unknown) {
          scope("comments", column, value);
          return {
            maybeSingle: async () => response(mock.responses.lookup, null),
          };
        },
      };
    },
    update() {
      mock.writes.push("comment:update");
      return {
        eq(column: string, value: unknown) {
          scope("comments", column, value);
          return {
            select() {
              return {
                maybeSingle: async () => response(mock.responses.update, null),
              };
            },
          };
        },
      };
    },
    delete() {
      mock.writes.push("comment:delete");
      return {
        eq(column: string, value: unknown) {
          scope("comments", column, value);
          return {
            select() {
              return {
                maybeSingle: async () => response(mock.responses.delete, null),
              };
            },
          };
        },
      };
    },
  };
  const commentVotes = {
    insert: async () => {
      mock.writes.push("vote:insert");
      return response(mock.responses.vote, null);
    },
    delete() {
      mock.writes.push("vote:delete");
      return {
        eq(column: string, value: unknown) {
          scope("comment_votes", column, value);
          return {
            eq(nextColumn: string, nextValue: unknown) {
              scope("comment_votes", nextColumn, nextValue);
              return response(mock.responses.vote, null);
            },
          };
        },
      };
    },
  };
  return {
    mock,
    client: {
      auth: { getUser: async () => ({ data: { user: { id: "viewer" } } }) },
      from(table: string) {
        if (table === "comments") return comments;
        if (table === "comment_votes") return commentVotes;
        throw new Error(`Unexpected table: ${table}`);
      },
    },
  };
}

/** Loads the real action source with only its network/framework edges replaced. */
export async function loadEngagementActions(
  client: unknown,
  revalidated: string[],
) {
  const path = fileURLToPath(
    new URL("../../lib/actions/engagement.ts", import.meta.url),
  );
  const source = await readFile(path, "utf8");
  const injected = source
    .replace(
      'import { revalidatePath } from "next/cache";',
      "const { revalidatePath } = globalThis.__engagementTest;",
    )
    .replace(
      'import { createClient } from "@/lib/supabase/server";',
      "const { createClient } = globalThis.__engagementTest;",
    )
    .replace(
      'import { ALL_TAGS } from "@/constants/lenses";',
      'const ALL_TAGS = ["Design", "Safety"];',
    );
  (
    globalThis as typeof globalThis & { __engagementTest: unknown }
  ).__engagementTest = {
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
