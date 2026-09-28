import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

/** Execute the real module, replacing only framework / network dependencies. */
export async function loadAuthModule(
  relativePath: string,
  dependencies: Record<string, unknown> = {},
) {
  const path = fileURLToPath(new URL(`../../${relativePath}`, import.meta.url));
  const source = await readFile(path, "utf8");
  const compiled = ts.transpileModule(source, {
    fileName: path,
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });
  const runtimeModule = { exports: {} };
  const require = createRequire(import.meta.url);
  vm.runInNewContext(compiled.outputText, {
    module: runtimeModule,
    exports: runtimeModule.exports,
    require: (name: string) =>
      Object.hasOwn(dependencies, name) ? dependencies[name] : require(name),
    URL,
  });
  return runtimeModule.exports as Record<string, (...args: never[]) => unknown>;
}
