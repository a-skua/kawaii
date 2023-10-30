import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import { Arg } from "./mod.ts";

Deno.test("Arg", () => {
  const arg = new Arg("--help");
  assertEquals(arg.buffer, new TextEncoder().encode("--help\0"));
});
