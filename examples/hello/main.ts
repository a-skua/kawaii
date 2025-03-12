import { instantiate } from "../../mod.ts";

const mod = await WebAssembly.compileStreaming(
  fetch(new URL("hello.wasm", import.meta.url)),
);

const { _start } = instantiate(mod);
_start();
