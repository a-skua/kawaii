import { instantiate } from "../../mod.ts";

const mod = await WebAssembly.compileStreaming(
  fetch(new URL("hello.wasm", import.meta.url)),
);

const { run } = instantiate(mod, true);
console.log(run("hello.wasm"));
