import Preview1, { Arg } from "./preview1.ts";

export class Kawaii {
  private readonly filepath: string;
  private readonly preview1: Preview1;

  private wasmModule: WebAssembly.Module | undefined;

  constructor(
    path: string,
  ) {
    const args = path.split(" ").filter((w) => w.length > 0); // FIXME
    this.filepath = args[0];
    this.preview1 = new Preview1(args.map((arg) => new Arg(arg)));
  }

  async init(importMetaUrl: string) {
    this.wasmModule = await WebAssembly.compileStreaming(
      fetch(new URL(this.filepath, importMetaUrl)),
    );
  }

  async run() {
    if (this.wasmModule === undefined) {
      throw new Error("wasm module is not initialized");
    }

    const instance = await WebAssembly.instantiate(this.wasmModule, {
      wasi_snapshot_preview1: this.preview1.importModule(),
    }) as {
      exports: {
        _start: () => void;
        memory: WebAssembly.Memory;
      };
    }; // TODO

    this.preview1.__init(instance.exports.memory);
    instance.exports._start();
  }
}

export default async function (path: string, importMetaUrl: string) {
  const kawaii = new Kawaii(path);
  await kawaii.init(importMetaUrl);
  try {
    await kawaii.run();
  } catch (e) {
    console.error(e);
  } finally {
    console.debug(kawaii);
  }
}
