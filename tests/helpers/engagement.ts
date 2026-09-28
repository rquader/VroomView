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
  conceptVoteWrites: { operation: "update" | "insert"; payload: unknown }[];
  responses: {
    lookup?: Response<{ concept_id: string } | null>;
    update?: Response<{ id: string; concept_id: string } | null>;
    delete?: Response<{ id: string; concept_id: string } | null>;
    vote?: Response<null>;
    conceptUpdates?: Response<{ concept_id: string }[]>[];
    conceptInsert?: Response<null>;
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
    conceptVoteWrites: [],
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
  let conceptUpdateIndex = 0;
  const conceptVotes = {
    update(payload: unknown) {
      mock.writes.push("concept-vote:update");
      mock.conceptVoteWrites.push({ operation: "update", payload });
      const result = response(
        mock.responses.conceptUpdates?.[conceptUpdateIndex++],
        [],
      );
      const query = {
        eq(column: string, value: unknown) {
          scope("concept_votes", column, value);
          return query;
        },
        select: async () => result,
        then: Promise.resolve(result).then.bind(Promise.resolve(result)),
      };
      return query;
    },
    insert: async (payload: unknown) => {
      mock.writes.push("concept-vote:insert");
      mock.conceptVoteWrites.push({ operation: "insert", payload });
      return response(mock.responses.conceptInsert, null);
    },
    delete() {
      mock.writes.push("concept-vote:delete");
      const query = {
        eq(column: string, value: unknown) {
          scope("concept_votes", column, value);
          return query;
        },
        then: Promise.resolve(ok(null)).then.bind(Promise.resolve(ok(null))),
      };
      return query;
    },
  };
  return {
    mock,
    client: {
      auth: { getUser: async () => ({ data: { user: { id: "viewer" } } }) },
      from(table: string) {
        if (table === "comments") return comments;
        if (table === "comment_votes") return commentVotes;
        if (table === "concept_votes") return conceptVotes;
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
