import { Exit } from "./wasip1/types.ts";
export * from "./wasip1/types.ts";
import wasip1Init, * as wasi_snapshot_preview1 from "./wasip1/mod.ts";

/**
 * WASIp1 Interface
 */
export interface Instance {
  run(...args: string[]): number;
}
export const Instance = (wasm: WebAssembly.Instance): Instance => {
  return {
    run(...args: string[]): number {
      let exitCode = 0;
      try {
        // deno-lint-ignore no-explicit-any
        const exports: any = wasm.exports;
        wasip1Init(exports.memory, { args });
        exports._start();
      } catch (e) {
        if (e instanceof Exit) {
          exitCode = e.code;
        } else {
          console.error(e);
          exitCode = 1;
        }
      }
      return exitCode;
    },
  };
};

/**
 * WASIp1 import Object
 */
export const imports = { wasi_snapshot_preview1 };

export { wasi_snapshot_preview1 };
