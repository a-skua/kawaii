import { Preview1 } from "../kawaii.ts";

const log: string[] = [];
const wasi_snapshot_preview1 = Preview1.Module as {
  [key: string]: (...args: unknown[]) => void;
};
for (const [name, fn] of Object.entries(wasi_snapshot_preview1)) {
  wasi_snapshot_preview1[name] = (...args: unknown[]) => {
    const logv = `=== ${name}(${args.join()})`;
    // console.debug(logv);
    log.push(logv);
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

const args = Deno.args.map((arg) => new Preview1.Arg(arg));
const envs = [
  new Preview1.Env("DEBUG", "1"),
];
Preview1.init({ memory, args, envs });

const strs: string[] = [];
Preview1.FS.find(new Preview1.Type.Fd(Preview1.Type.Fd.stdout))?.hooks.push(
  (_event, msg) => strs.push(msg),
);
Preview1.FS.find(new Preview1.Type.Fd(Preview1.Type.Fd.stderr))?.hooks.push(
  (_event, msg) => strs.push(msg),
);

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
