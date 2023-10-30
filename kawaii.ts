import Preview1, { Arg } from "./preview1.ts";

export class Kawaii {
  private readonly filepath: string;
  private readonly preview1: Preview1;

  private wasmModule: WebAssembly.Module | undefined;

  constructor(
    path: string,
    private readonly debug: boolean,
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

    const preview1 = this.preview1.importModule();
    const instance = await WebAssembly.instantiate(this.wasmModule, {
      wasi_snapshot_preview1: this.debug
        ? Object.keys(preview1).map((key) => ({
          key,
          fn: (...args: unknown[]) => {
            console.debug(`==== ${key}(${args})`);
            // @ts-ignore debug
            return preview1[key](...args);
          },
        })).reduce((preview1, obj) => {
          // @ts-ignore debug
          preview1[obj.key] = obj.fn;
          return preview1;
        }, {})
        : preview1,
    }) as {
      exports: {
        _start: () => void;
        memory: WebAssembly.Memory;
      };
    }; // TODO

    this.preview1.init(instance.exports.memory);
    instance.exports._start();
  }
}

export default async function (
  path: string,
  importMetaUrl: string,
  debug = false,
) {
  const kawaii = new Kawaii(path, debug);
  await kawaii.init(importMetaUrl);
  try {
    await kawaii.run();
  } catch (e) {
    console.error(e);
  } finally {
    console.debug(kawaii);
  }
}
