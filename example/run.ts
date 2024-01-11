import { Preview1 } from "../kawaii.ts";

const log: string[] = [];
const wasi_snapshot_preview1 = Preview1.Module as {
  [key: string]: (...args: unknown[]) => void;
};
for (const [name, fn] of Object.entries(wasi_snapshot_preview1)) {
  wasi_snapshot_preview1[name] = (...args: unknown[]) => {
    log.push(`=== ${name}(${args.join()})`);
    return fn(...args);
  };
}

const { _start, memory } = await WebAssembly.instantiateStreaming(
  fetch(new URL(Deno.args[0], import.meta.url)),
  { wasi_snapshot_preview1 },
).then(({ instance }) =>
  instance.exports as {
    _start: () => void;
    memory: WebAssembly.Memory;
  }
);

const strs: string[] = [];
const stdout = (str: string) => strs.push(str);
const stderr = (str: string) => strs.push(str);

Preview1.init({ memory, stdout, stderr });

try {
  _start();
} catch (e) {
  console.error(e);
} finally {
  console.debug(strs.join(""));
  for (const debug of log) {
    console.debug(debug);
  }
}
