import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.204.0/assert/mod.ts";
import {
  BigValue,
  Clockid,
  Data,
  Errno,
  Exitcode,
  Fd,
  Fdflags,
  Fdstat,
  Filetype,
  Pointer,
  Rights,
  Value,
} from "./type.ts";
import init, {
  Arg,
  args_get,
  args_sizes_get,
  clock_time_get,
  Env,
  environ_get,
  environ_sizes_get,
  Exit,
  fd_fdstat_get,
  fd_fdstat_set_flags,
  fd_write,
  poll_oneoff,
  proc_exit,
  random_get,
  sched_yield,
} from "./mod.ts";

interface DataType {
  alignment: number;
}

const randomPointer = <T extends Data<string>>(
  { alignment }: DataType,
): Pointer<T> => {
  const random = Math.floor(Math.random() * (1024 / alignment));
  return Pointer(random * alignment);
};

Deno.test(Arg.name, () => {
  const arg = new Arg("foo");
  assertEquals(`${arg}`, "foo");
});

Deno.test(Env.name, () => {
  const env = new Env("TEST", "Running");
  assertEquals(`${env}`, "TEST=Running");
});

Deno.test(sched_yield.name, () => {
  assertEquals(sched_yield(), Errno.nosys);
});

Deno.test(proc_exit.name, () => {
  let catched = false;
  try {
    proc_exit(Value(1));
  } catch (err) {
    assertEquals(err, new Exit(new Exitcode(Value(1))));
    catched = true;
  }

  assert(catched, "Failed Catch");
});

Deno.test(args_get.name, () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const args = [new Arg("foo"), new Arg("bar")];
  const encoder = new TextEncoder();

  init({ memory, args });

  assertEquals(args_get(Pointer(0), Pointer(8)), Errno.success);
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

  assertEquals(
    args_sizes_get(Pointer(0), Pointer(4)),
    Errno.success,
  );
  assertEquals(
    new Uint8Array(memory.buffer).slice(0, 8),
    new Uint8Array([
      ...[2, 0, 0, 0], // args_num
      ...[8, 0, 0, 0], // buf_size
    ]),
  );
});

Deno.test("clock_time_get", async (t) => {
  const memory = new WebAssembly.Memory({ initial: 1 });

  init({ memory });

  const data = new DataView(memory.buffer);

  await t.step("realtime", () => {
    const pointer = 0;

    assertEquals(
      clock_time_get(Clockid.realtime, BigValue(0n), Pointer(pointer)),
      Errno.success,
    );
    assertEquals(
      data.getBigUint64(pointer, true),
      BigInt(new Date().getTime()) * 1_000_000n,
    );
  });

  await t.step("monotonic", () => {
    const pointer = 8;
    assertEquals(
      clock_time_get(Clockid.monotonic, BigValue(0n), Pointer(pointer)),
      Errno.success,
    );
    assertEquals(
      data.getBigUint64(pointer, true),
      BigInt(performance.now()) * 1_000_000n,
    );
  });

  await t.step("process_cputime_id", () => {
    const pointer = 16;

    assertEquals(
      clock_time_get(
        Clockid.process_cputime_id,
        BigValue(0n),
        Pointer(pointer),
      ),
      Errno.notsup,
    );
  });

  await t.step("thread_cputime_id", () => {
    const pointer = 24;

    assertEquals(
      clock_time_get(
        Clockid.thread_cputime_id,
        BigValue(0n),
        Pointer(pointer),
      ),
      Errno.notsup,
    );
  });
});

Deno.test(environ_get.name, () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const envs = [new Env("FOO", "foo"), new Env("BAR", "bar")];
  const encoder = new TextEncoder();

  init({ memory, envs });
  assertEquals(
    environ_get(Pointer(0), Pointer(8)),
    Errno.success,
  );
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

  assertEquals(
    environ_sizes_get(Pointer(0), Pointer(4)),
    Errno.success,
  );
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

    assertEquals(
      fd_write(Fd.stdout, Pointer(4), Value(2), Pointer(0)),
      Errno.success,
    );
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

    assertEquals(
      fd_write(Fd.stderr, Pointer(4), Value(2), Pointer(0)),
      Errno.success,
    );
    assertEquals(data.getUint32(0, true), 13);
    assertEquals(stderr, "Hello, World!");
  });
});

Deno.test(random_get.name, () => {
  const memory = new WebAssembly.Memory({ initial: 1 });

  init({ memory });

  assertEquals(
    random_get(Pointer(100), Value(8)),
    Errno.success,
  );
  assert(new Uint8Array(memory.buffer, 100, 8).reduce((sum, n) => sum + n) > 0);
});

Deno.test(poll_oneoff.name, async (t) => {
  await t.step("nsubscriptions is 0", () => {
    assertEquals(
      poll_oneoff(Pointer(0), Pointer(0), Value(0), Pointer(0)),
      Errno.inval,
    );
  });

  await t.step("normal", () => {
    assertEquals(
      poll_oneoff(Pointer(0), Pointer(0), Value(1), Pointer(0)),
      Errno.notsup,
    );
  });
});

Deno.test("fd_fdstat_get", async (t) => {
  await t.step("stdin", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    const pointer: Pointer<Fdstat> = randomPointer(Fdstat);
    assertEquals(fd_fdstat_get(Fd.stdin, pointer), Errno.success);
    assertEquals(
      Fdstat.cast(memory, pointer),
      new Fdstat({
        fs_filetype: new Filetype(Filetype.character_device),
        fs_flags: new Fdflags(Fdflags.nonblock),
        fs_rights_base: Rights.no(),
        fs_rights_inheriting: Rights.no(),
      }),
    );
  });

  await t.step("stdout", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    const pointer: Pointer<Fdstat> = randomPointer(Fdstat);
    assertEquals(
      fd_fdstat_get(Fd.stdout, pointer),
      Errno.success,
    );
    assertEquals(
      Fdstat.cast(memory, pointer),
      new Fdstat({
        fs_filetype: new Filetype(Filetype.character_device),
        fs_flags: new Fdflags(Fdflags.nonblock),
        fs_rights_base: new Rights(Rights.fd_write),
        fs_rights_inheriting: new Rights(Rights.fd_write),
      }),
    );
  });

  await t.step("stderr", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    const pointer: Pointer<Fdstat> = randomPointer(Fdstat);
    assertEquals(
      fd_fdstat_get(Fd.stderr, pointer),
      Errno.success,
    );
    assertEquals(
      Fdstat.cast(memory, pointer),
      new Fdstat({
        fs_filetype: new Filetype(Filetype.character_device),
        fs_flags: new Fdflags(Fdflags.nonblock),
        fs_rights_base: new Rights(Rights.fd_write),
        fs_rights_inheriting: new Rights(Rights.fd_write),
      }),
    );
  });

  await t.step("undefined", () => {
    const pointer: Pointer<Fdstat> = randomPointer(Fdstat);
    assertEquals(fd_fdstat_get(Value(3), pointer), Errno.badf);
  });
});

Deno.test("fd_fdstat_set_flags", async (t) => {
  await t.step("stdin", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    assertEquals(
      fd_fdstat_set_flags(Fd.stdin, Fdflags.nonblock),
      Errno.success,
    );
  });

  await t.step("stdout", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    assertEquals(
      fd_fdstat_set_flags(Fd.stdout, Fdflags.nonblock),
      Errno.success,
    );
  });

  await t.step("stderr", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    assertEquals(
      fd_fdstat_set_flags(Fd.stderr, Fdflags.nonblock),
      Errno.success,
    );
  });
  await t.step("undefined", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    assertEquals(
      fd_fdstat_set_flags(Value(3), Fdflags.nonblock),
      Errno.badf,
    );
  });
});
