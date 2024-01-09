import Preview1, { Arg } from "./preview1.ts";

class Kawaii {
  private readonly preview1: Preview1;

  constructor(
    private readonly wasmModule: WebAssembly.Module,
    readonly args: Arg[],
    private debug: boolean = false,
  ) {
    this.preview1 = new Preview1(args);
  }

  static async new(
    args: Arg[],
    importMetaUrl: string,
    debug = false,
  ): Promise<Kawaii> {
    return new Kawaii(
      await WebAssembly.compileStreaming(
        fetch(new URL(`${args[0]}`, importMetaUrl)),
      ),
      args,
      debug,
    );
  }

  async run() {
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
  const kawaii = await Kawaii.new(
    path.split(" ").filter((w) => w.length > 0).map((arg) => new Arg(arg)),
    importMetaUrl,
    debug,
  );

  try {
    await kawaii.run();
  } catch (e) {
    console.error(e);
  } finally {
    console.debug(kawaii);
  }
}
