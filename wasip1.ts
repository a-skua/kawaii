import * as wasi_snapshot_preview1 from "./wasip1/mod.ts";
/**
 * WASIp1 Interface
 */
export interface Instance {
  _start(): void;
}

/**
 * WASIp1 import Object
 */
export const imports = { wasi_snapshot_preview1 };
