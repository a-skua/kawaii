import { imports, type Instance } from "./wasip1.ts";

export function instantiate(mod: WebAssembly.Module): Instance {
  const instance = new WebAssembly.Instance(mod, imports);
  return instance.exports as never;
}
