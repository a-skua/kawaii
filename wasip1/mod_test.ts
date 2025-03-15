import { assertEquals, assertThrows } from "@std/assert";
import { Exit, Exitcode } from "./types.ts";
import * as wasip1 from "./mod.ts";

Deno.test("proc_exit", () => {
  assertThrows(() => wasip1.proc_exit(Exitcode(0)), Exit, "Exit 0");
});

Deno.test("args_get", async (t) => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const dataView = new DataView(memory.buffer);
  const decoder = new TextDecoder();

  const args = ["deno", "run", "hello.wasm"];
  wasip1._init(memory, ["deno", "run", "hello.wasm"]);

  let buf = args.length * 4;
  assertEquals(wasip1.args_get(0, buf), 0);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    await t.step(`args[${i}]`, () => {
      assertEquals(dataView.getUint32(i * 4, true), buf);
      assertEquals(
        decoder.decode(
          new Uint8Array(memory.buffer.slice(buf, buf + arg.length)),
        ),
        arg,
      );
    });
    buf += arg.length + 1;
  }
});

Deno.test("args_sizes_get", () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const dataView = new DataView(memory.buffer);
  const args = ["deno", "run", "hello.wasm"];

  wasip1._init(memory, args);

  assertEquals(wasip1.args_sizes_get(0, 4), 0);
  assertEquals(dataView.getUint32(0, true), args.length);
  assertEquals(
    dataView.getUint32(4, true),
    args.reduce((acc, arg) => acc + arg.length + 1, 0),
  );
});
