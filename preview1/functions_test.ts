import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { Arg, Preview1 } from "./mod.ts";
import { args_get, args_sizes_get } from "./functions.ts";
import { Exitcode } from "./types.ts";

class Mock implements Preview1 {
  constructor(
    public args: Arg[],
    public memory: WebAssembly.Memory,
    public exitcode: Exitcode,
  ) {}
}

Deno.test("args_sizes_get", () => {
  const mock = new Mock(
    [new Arg("--help"), new Arg("-name=FOO")],
    new WebAssembly.Memory({ initial: 1 }),
    0,
  );
  const expect = (() => {
    const expect = new Uint8Array(
      new WebAssembly.Memory({ initial: 1 }).buffer,
    );
    const data = new DataView(expect.buffer);
    data.setUint32(0, 2, true);
    data.setUint32(4, "--help\0-name=FOO\0".length, true);
    return expect;
  })();

  args_sizes_get(mock)(0, 4);

  assertEquals(new Uint8Array(mock.memory.buffer), expect);
});

Deno.test("args_get", () => {
  const mock = new Mock(
    [new Arg("--help"), new Arg("-name=FOO")],
    new WebAssembly.Memory({ initial: 1 }),
    0,
  );
  const expect = (() => {
    const expect = new Uint8Array(
      new WebAssembly.Memory({ initial: 1 }).buffer,
    );
    const data = new DataView(expect.buffer);
    data.setUint32(10, 100, true);
    data.setUint32(14, 100 + "--help\0".length, true);
    (new TextEncoder()).encodeInto("--help\0-name=FOO\0", expect.subarray(100));
    return expect;
  })();

  args_get(mock)(10, 100);
  assertEquals(new Uint8Array(mock.memory.buffer), expect);
});
