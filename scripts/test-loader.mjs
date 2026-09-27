// Compile application TypeScript in memory for Node's built-in test runner.
// This keeps test tooling independent of the Next.js build and live services.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import ts from "typescript";

export async function resolve(specifier, context, nextResolve) {
  const target = specifier.startsWith("@/")
    ? new URL(`../${specifier.slice(2)}`, import.meta.url).href
    : specifier;
  try {
    return await nextResolve(target, context);
  } catch (error) {
    if (error.code !== "ERR_MODULE_NOT_FOUND" || !/^(\.|file:)/.test(target))
      throw error;
    return nextResolve(`${target}.ts`, context);
  }
}

export async function load(url, context, nextLoad) {
  if (!url.endsWith(".ts")) return nextLoad(url, context);
  const source = await readFile(new URL(url), "utf8");
  const compiled = ts.transpileModule(source, {
    fileName: fileURLToPath(url),
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  return { format: "module", source: compiled.outputText, shortCircuit: true };
}
