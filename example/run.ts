import { Preview1 } from "../kawaii.ts";

const { instance } = await WebAssembly.instantiateStreaming(
  fetch(new URL(Deno.args[0], import.meta.url)),
  { wasi_snapshot_preview1: Preview1.Module },
);
const { _start, memory } = instance.exports as {
  _start: () => void;
  memory: WebAssembly.Memory;
};

Preview1.init({
  memory,
});
_start();
