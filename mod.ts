import { imports, Instance } from "./wasip1.ts";
/**
 * instantiate
 */
export function instantiate(
  mod: WebAssembly.Module,
  debug: boolean = false,
): Instance {
  const importObject: WebAssembly.Imports = debug
    ? {
      wasi_snapshot_preview1: Object.fromEntries(
        Object.entries(imports.wasi_snapshot_preview1).map((
          [key, fn],
        ) => [key, (...args: unknown[]) => {
          console.debug(`\t==== ${key}(${args.join(", ")})`);
          return (fn as unknown as (...args: unknown[]) => unknown)(...args);
        }]),
      ),
    }
    : imports;
  const wasm = new WebAssembly.Instance(mod, importObject);
  return Instance(wasm);
}
