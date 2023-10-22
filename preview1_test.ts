import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { Arg } from "./preview1.ts";

Deno.test("Arg", () => {
  const arg = new Arg("--help");
  assertEquals(arg.buffer, new TextEncoder().encode("--help\0"));
});
