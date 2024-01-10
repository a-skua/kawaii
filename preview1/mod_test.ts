import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.204.0/assert/mod.ts";
import { Clockid, Errno, Fd } from "./type.ts";
import init, {
  Arg,
  args_get,
  args_sizes_get,
  clock_time_get,
  Env,
  environ_get,
  environ_sizes_get,
  Exit,
  fd_write,
  poll_oneoff,
  proc_exit,
  random_get,
  sched_yield,
} from "./mod.ts";

Deno.test(Arg.name, () => {
  const arg = new Arg("foo");
  assertEquals(`${arg}`, "foo");
});

Deno.test(Env.name, () => {
  const env = new Env("TEST", "Running");
  assertEquals(`${env}`, "TEST=Running");
});

Deno.test(sched_yield.name, () => {
  assertEquals(Errno[sched_yield()], Errno[Errno.Nosys]);
});

Deno.test(proc_exit.name, () => {
  let catched = false;
  try {
    proc_exit(1);
  } catch (err) {
    assertEquals(err, new Exit(1));
    catched = true;
  }

  assert(catched, "Failed Catch");
});

Deno.test(args_get.name, () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const args = [new Arg("foo"), new Arg("bar")];
  const encoder = new TextEncoder();

  init({ memory, args });

  assertEquals(Errno[args_get(0, 8)], Errno[Errno.Success]);
  assertEquals(
    new Uint8Array(memory.buffer).slice(0, 16),
    new Uint8Array([
      ...[8, 0, 0, 0], // Pointer<"foo\0">
      ...[12, 0, 0, 0], // Pointer<"bar\0">
      ...encoder.encode("foo\0"), // "foo\0"
      ...encoder.encode("bar\0"), // "bar\0"
    ]),
  );
});

Deno.test(args_sizes_get.name, () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const args = [new Arg("foo"), new Arg("bar")];

  init({ memory, args });

  assertEquals(Errno[args_sizes_get(0, 4)], Errno[Errno.Success]);
  assertEquals(
    new Uint8Array(memory.buffer).slice(0, 8),
    new Uint8Array([
      ...[2, 0, 0, 0], // args_num
      ...[8, 0, 0, 0], // buf_size
    ]),
  );
});

Deno.test(clock_time_get.name, async (t) => {
  const memory = new WebAssembly.Memory({ initial: 1 });

  init({ memory });

  const data = new DataView(memory.buffer);

  await t.step(Clockid[Clockid.Realtime], () => {
    const pointer = 0;

    assertEquals(
      Errno[clock_time_get(Clockid.Realtime, 0n, pointer)],
      Errno[Errno.Success],
    );
    assertEquals(
      data.getBigUint64(pointer, true),
      BigInt(new Date().getTime()) * 1_000_000n,
    );
  });

  await t.step(Clockid[Clockid.Monotonic], () => {
    const pointer = 8;
    assertEquals(
      Errno[clock_time_get(Clockid.Monotonic, 0n, pointer)],
      Errno[Errno.Success],
    );
    assertEquals(
      data.getBigUint64(pointer, true),
      BigInt(performance.now()) * 1_000_000n,
    );
  });

  await t.step(Clockid[Clockid.ProcessCputimeId], () => {
    const pointer = 16;

    assertEquals(
      Errno[clock_time_get(Clockid.ProcessCputimeId, 0n, pointer)],
      Errno[Errno.Notsup],
    );
  });

  await t.step(Clockid[Clockid.ThreadCputimeId], () => {
    const pointer = 24;

    assertEquals(
      Errno[clock_time_get(Clockid.ThreadCputimeId, 0n, pointer)],
      Errno[Errno.Notsup],
    );
  });
});

Deno.test(environ_get.name, () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const envs = [new Env("FOO", "foo"), new Env("BAR", "bar")];
  const encoder = new TextEncoder();

  init({ memory, envs });
  assertEquals(Errno[environ_get(0, 8)], Errno[Errno.Success]);
  assertEquals(
    new Uint8Array(memory.buffer).slice(0, 24),
    new Uint8Array([
      ...[8, 0, 0, 0], // Pointer<"FOO=foo\0">
      ...[16, 0, 0, 0], // Pointer<"BAR=bar\0">
      ...encoder.encode("FOO=foo\0"), // "FOO=foo\0"
      ...encoder.encode("BAR=bar\0"), // "BAR=bar\0"
    ]),
  );
});

Deno.test(environ_sizes_get.name, () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const envs = [new Env("FOO", "foo"), new Env("BAR", "bar")];

  init({ memory, envs });

  assertEquals(Errno[environ_sizes_get(0, 4)], Errno[Errno.Success]);
  assertEquals(
    new Uint8Array(memory.buffer).slice(0, 8),
    new Uint8Array([
      ...[2, 0, 0, 0], // env_num
      ...[16, 0, 0, 0], // buf_size
    ]),
  );
});

Deno.test(fd_write.name, async (t) => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const array = new Uint8Array(memory.buffer);
  const data = new DataView(memory.buffer);
  const encoder = new TextEncoder();
  let stdout = "";
  let stderr = "";

  init({
    memory,
    stdout: (str) => stdout += str,
    stderr: (str) => stderr += str,
  });

  await t.step("Stdout", () => {
    data.setUint32(4, 100, true);
    data.setUint32(8, 5, true);
    encoder.encodeInto("Hello", array.subarray(100));

    data.setUint32(12, 105, true);
    data.setUint32(16, 5, true);
    encoder.encodeInto("World", array.subarray(105));

    assertEquals(Errno[fd_write(Fd.Stdout, 4, 2, 0)], Errno[Errno.Success]);
    assertEquals(data.getUint32(0, true), 10);
    assertEquals(stdout, "HelloWorld");
  });

  await t.step("Stderr", () => {
    data.setUint32(4, 100, true);
    data.setUint32(8, 7, true);
    encoder.encodeInto("Hello, ", array.subarray(100));

    data.setUint32(12, 107, true);
    data.setUint32(16, 6, true);
    encoder.encodeInto("World!", array.subarray(107));

    assertEquals(Errno[fd_write(Fd.Stderr, 4, 2, 0)], Errno[Errno.Success]);
    assertEquals(data.getUint32(0, true), 13);
    assertEquals(stderr, "Hello, World!");
  });
});

Deno.test(random_get.name, () => {
  const memory = new WebAssembly.Memory({ initial: 1 });

  init({ memory });

  assertEquals(Errno[random_get(100, 8)], Errno[Errno.Success]);
  assert(new Uint8Array(memory.buffer, 100, 8).reduce((sum, n) => sum + n) > 0);
});

Deno.test(poll_oneoff.name, () => {
  assertEquals(Errno[poll_oneoff(0, 0, 0, 0)], Errno[Errno.Nosys]);
});
