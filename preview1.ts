import { Exitcode } from "./preview1/types.ts";
import { Arg, ImportModule, Preview1 } from "./preview1/mod.ts";
import importModule from "./preview1/functions.ts";

export { Arg } from "./preview1/mod.ts";

export default class implements Preview1 {
  // @ts-ignore lazy init
  memory: WebAssembly.Memory;
  exitcode: Exitcode = 0;
  constructor(
    readonly args: Arg[],
  ) {
  }

  init(memory: WebAssembly.Memory) {
    this.memory = memory;
  }

  importModule(): ImportModule {
    return importModule(this);
  }
}
