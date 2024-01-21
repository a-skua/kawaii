import { assert, assertEquals } from "assert";
import * as FS from "./fs.ts";
import {
  BigValue,
  Clockid,
  Data,
  Dircookie,
  Dirent,
  Dirnamlen,
  Errno,
  Event,
  EventFdReadwrite,
  Eventtype,
  Exitcode,
  Fd,
  Fdflags,
  Fdstat,
  Filestat,
  Filetype,
  Inode,
  Iovec,
  Oflags,
  Pointer,
  Preopentype,
  Prestat,
  PrestatDir,
  Rights,
  Size,
  Subclockflags,
  Subscription,
  SubscriptionClock,
  SubscriptionFdReadwrite,
  SubscriptionU,
  Timestamp,
  Userdata,
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
  fd_close,
  fd_fdstat_get,
  fd_fdstat_set_flags,
  fd_prestat_dir_name,
  fd_prestat_get,
  fd_read,
  fd_readdir,
  fd_write,
  path_filestat_get,
  path_open,
  poll_oneoff,
  proc_exit,
  random_get,
  sched_yield,
} from "./mod.ts";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

const toBigValue = <T extends Data<string>>(v: bigint): BigValue<T> =>
  v as BigValue<T>;

const toValue = <T extends Data<string>>(v: number): Value<number, T> =>
  v as Value<number, T>;

interface DataType {
  alignment: number;
}

const toPointer = toValue;

const randomPointer = <T extends Data<string>>(
  { alignment }: DataType,
): Pointer<T> => {
  const random = Math.floor(Math.random() * (1024 / alignment));
  return new Pointer(random * alignment);
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
    proc_exit(toValue(1));
  } catch (err) {
    assertEquals(err, new Exit(new Exitcode(toValue(1))));
    catched = true;
  }

  assert(catched, "Failed Catch");
});

Deno.test(args_get.name, () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const args = [new Arg("foo"), new Arg("bar")];
  const encoder = new TextEncoder();

  init({ memory, args });

  assertEquals(args_get(toPointer(0), toPointer(8)), Errno.success);
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
    args_sizes_get(toPointer(0), toPointer(4)),
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
      clock_time_get(Clockid.realtime, toBigValue(0n), toPointer(pointer)),
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
      clock_time_get(Clockid.monotonic, toBigValue(0n), toPointer(pointer)),
      Errno.success,
    );
    assertEquals(
      data.getBigUint64(pointer, true) / 1_000_000n,
      BigInt(Math.floor(performance.now())),
    );
  });

  await t.step("process_cputime_id", () => {
    const pointer = 16;

    assertEquals(
      clock_time_get(
        Clockid.process_cputime_id,
        toBigValue(0n),
        toPointer(pointer),
      ),
      Errno.notsup,
    );
  });

  await t.step("thread_cputime_id", () => {
    const pointer = 24;

    assertEquals(
      clock_time_get(
        Clockid.thread_cputime_id,
        toBigValue(0n),
        toPointer(pointer),
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
    environ_get(toPointer(0), toPointer(8)),
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
    environ_sizes_get(toPointer(0), toPointer(4)),
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

Deno.test("fd_write", async (t) => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const array = new Uint8Array(memory.buffer);
  const data = new DataView(memory.buffer);
  const encoder = new TextEncoder();
  let stdout = "";
  let stderr = "";

  init({ memory });
  FS.findByFd(new Fd(Fd.stdout))?.hooks.push(
    (_event, msg) => stdout += msg,
  );
  FS.findByFd(new Fd(Fd.stderr))?.hooks.push(
    (_event, msg) => stderr += msg,
  );

  await t.step("Stdout", () => {
    data.setUint32(4, 100, true);
    data.setUint32(8, 5, true);
    encoder.encodeInto("Hello", array.subarray(100));

    data.setUint32(12, 105, true);
    data.setUint32(16, 5, true);
    encoder.encodeInto("World", array.subarray(105));

    assertEquals(
      fd_write(Fd.stdout, toPointer(4), toValue(2), toPointer(0)),
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
      fd_write(Fd.stderr, toPointer(4), toValue(2), toPointer(0)),
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
    random_get(toPointer(100), toValue(8)),
    Errno.success,
  );
  assert(new Uint8Array(memory.buffer, 100, 8).reduce((sum, n) => sum + n) > 0);
});

Deno.test("poll_oneoff", async (t) => {
  await t.step("nsubscriptions is 0", () => {
    assertEquals(
      poll_oneoff(toPointer(0), toPointer(0), toValue(0), toPointer(0)),
      Errno.inval,
    );
  });

  await t.step("normal", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    const subscriptions = [
      new Subscription({
        userdata: new Userdata(toBigValue(1n)),
        u: new SubscriptionU({
          type: new Eventtype(Eventtype.clock),
          content: new SubscriptionClock({
            id: new Clockid(Clockid.realtime),
            timeout: new Timestamp(toBigValue(0n)),
            precision: new Timestamp(toBigValue(0n)),
            flags: Subclockflags.zero(),
          }),
        }),
      }),
      new Subscription({
        userdata: new Userdata(toBigValue(2n)),
        u: new SubscriptionU({
          type: new Eventtype(Eventtype.fd_read),
          content: new SubscriptionFdReadwrite({
            fd: new Fd(toValue(0)),
          }),
        }),
      }),
    ];

    const ins = 100;
    for (let i = 0; i < subscriptions.length; i += 1) {
      subscriptions[i].store(memory, new Pointer(ins), Subscription.size * i);
    }
    const out = 200;
    const events = [
      new Event({
        userdata: new Userdata(toBigValue(1n)),
        error: new Errno(Errno.notsup),
        type: new Eventtype(Eventtype.clock),
        fd_readwrite: EventFdReadwrite.zero(),
      }),
      new Event({
        userdata: new Userdata(toBigValue(2n)),
        error: new Errno(Errno.notsup),
        type: new Eventtype(Eventtype.fd_read),
        fd_readwrite: EventFdReadwrite.zero(),
      }),
    ];

    const result = 300;

    assertEquals(
      poll_oneoff(
        toPointer(ins),
        toPointer(out),
        toValue(subscriptions.length),
        toPointer(result),
      ),
      Errno.success,
    );
    assertEquals(
      Size.cast(memory, new Pointer(result)),
      new Size(toValue(events.length)),
    );
    for (let i = 0; i < events.length; i += 1) {
      assertEquals(
        Event.cast(memory, new Pointer(out), Event.size * i),
        events[i],
      );
    }
  });
});

Deno.test("fd_fdstat_get", async (t) => {
  await t.step("stdin", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    const pointer: Pointer<Fdstat> = randomPointer(Fdstat);
    assertEquals(
      fd_fdstat_get(Fd.stdin, toPointer(pointer.value)),
      Errno.success,
    );
    assertEquals(
      Fdstat.cast(memory, pointer),
      new Fdstat({
        fs_filetype: new Filetype(Filetype.character_device),
        fs_flags: new Fdflags(Fdflags.nonblock),
        fs_rights_base: Rights.zero(),
        fs_rights_inheriting: Rights.zero(),
      }),
    );
  });

  await t.step("stdout", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    const pointer: Pointer<Fdstat> = randomPointer(Fdstat);
    assertEquals(
      fd_fdstat_get(Fd.stdout, toPointer(pointer.value)),
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
      fd_fdstat_get(Fd.stderr, toPointer(pointer.value)),
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

  await t.step("home", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    const pointer: Pointer<Fdstat> = randomPointer(Fdstat);
    assertEquals(
      fd_fdstat_get(Fd.home, toPointer(pointer.value)),
      Errno.success,
    );
    assertEquals(
      Fdstat.cast(memory, pointer),
      new Fdstat({
        fs_filetype: new Filetype(Filetype.directory),
        fs_flags: Fdflags.zero(),
        fs_rights_base: Rights.zero(),
        fs_rights_inheriting: Rights.zero(),
      }),
    );
  });

  await t.step("root", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    const pointer: Pointer<Fdstat> = randomPointer(Fdstat);
    assertEquals(
      fd_fdstat_get(Fd.root, toPointer(pointer.value)),
      Errno.success,
    );
    assertEquals(
      Fdstat.cast(memory, pointer),
      new Fdstat({
        fs_filetype: new Filetype(Filetype.directory),
        fs_flags: Fdflags.zero(),
        fs_rights_base: Rights.zero(),
        fs_rights_inheriting: Rights.zero(),
      }),
    );
  });

  await t.step("undefined", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    const pointer: Pointer<Fdstat> = randomPointer(Fdstat);
    assertEquals(
      fd_fdstat_get(toValue(5), toPointer(pointer.value)),
      Errno.badf,
    );
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

  await t.step("home", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    assertEquals(
      fd_fdstat_set_flags(Fd.home, Fdflags.nonblock),
      Errno.success,
    );
  });

  await t.step("root", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    assertEquals(
      fd_fdstat_set_flags(Fd.root, Fdflags.nonblock),
      Errno.success,
    );
  });

  await t.step("undefined", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    assertEquals(
      fd_fdstat_set_flags(toValue(5), Fdflags.nonblock),
      Errno.badf,
    );
  });
});

Deno.test("fd_prestat_get", async (t) => {
  await t.step("home", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Prestat);
    init({ memory });

    assertEquals(
      fd_prestat_get(Fd.home, toPointer(pointer.value)),
      Errno.success,
    );
    assertEquals(
      Prestat.cast(memory, pointer),
      new Prestat({
        type: new Preopentype(Preopentype.dir),
        content: new PrestatDir({
          pr_name_len: new Size("/home/kawaii/".length),
        }),
      }),
    );
  });

  await t.step("root", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Prestat);
    init({ memory });

    assertEquals(
      fd_prestat_get(Fd.root, toPointer(pointer.value)),
      Errno.success,
    );
    assertEquals(
      Prestat.cast(memory, pointer),
      new Prestat({
        type: new Preopentype(Preopentype.dir),
        content: new PrestatDir({
          pr_name_len: new Size("/".length),
        }),
      }),
    );
  });
});

Deno.test("fd_readdir", async (t) => {
  await t.step("not found file", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Dirent);
    init({ memory });

    assertEquals(
      fd_readdir(
        toValue(5),
        toPointer(pointer.value),
        toValue(100),
        toBigValue(0n),
        toPointer(0),
      ),
      Errno.badf,
    );
  });
  await t.step("/test_fd_readdir", () => {
    const dir = new FS.File({
      name: new FS.FileName("test_fd_readdir"),
      type: FS.File.type.dir,
    }).append(
      new FS.File({
        name: new FS.FileName("test_file1"),
        type: FS.File.type.regularFile,
      }),
      new FS.File({
        name: new FS.FileName("test_file2"),
        type: FS.File.type.regularFile,
      }),
      new FS.File({
        name: new FS.FileName("test_file3"),
        type: FS.File.type.regularFile,
      }),
    );
    FS.File.root.append(dir);

    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    const fd = FS.open(dir, Fdflags.zero());

    assertEquals(
      fd_readdir(
        fd.value,
        toPointer(200),
        toValue(100),
        toBigValue(0n),
        toPointer(0),
      ),
      Errno.success,
    );

    assertEquals(
      Size.cast(memory, new Pointer(0)),
      new Size(Dirent.size + 10),
    );
    assertEquals(
      Dirent.cast(memory, new Pointer(200), 0),
      new Dirent({
        d_next: new Dircookie(1n),
        d_ino: new Inode(dir.children[0].id.value),
        d_namlen: new Dirnamlen(10),
        d_type: new Filetype(Filetype.regular_file),
      }),
    );
    assertEquals(
      decoder.decode(new Uint8Array(memory.buffer, 224, 10)),
      "test_file1",
    );

    assertEquals(
      fd_readdir(
        fd.value,
        toPointer(200),
        toValue(100),
        toBigValue(0n),
        toPointer(0),
      ),
      Errno.success,
    );
    assertEquals(
      Size.cast(memory, new Pointer(0)),
      new Size(Dirent.size + 10),
    );
    assertEquals(
      Dirent.cast(memory, new Pointer(200), 0),
      new Dirent({
        d_next: new Dircookie(1n),
        d_ino: new Inode(dir.children[0].id.value),
        d_namlen: new Dirnamlen(10),
        d_type: new Filetype(Filetype.regular_file),
      }),
    );
    assertEquals(
      decoder.decode(new Uint8Array(memory.buffer, 224, 10)),
      "test_file1",
    );

    assertEquals(
      fd_readdir(
        fd.value,
        toPointer(200),
        toValue(100),
        toBigValue(1n),
        toPointer(0),
      ),
      Errno.success,
    );
    assertEquals(
      Size.cast(memory, new Pointer(0)),
      new Size(Dirent.size + 10),
    );
    assertEquals(
      Dirent.cast(memory, new Pointer(200), 0),
      new Dirent({
        d_next: new Dircookie(2n),
        d_ino: new Inode(dir.children[1].id.value),
        d_namlen: new Dirnamlen(10),
        d_type: new Filetype(Filetype.regular_file),
      }),
    );
    assertEquals(
      decoder.decode(new Uint8Array(memory.buffer, 224, 10)),
      "test_file2",
    );

    assertEquals(
      fd_readdir(
        fd.value,
        toPointer(200),
        toValue(100),
        toBigValue(2n),
        toPointer(0),
      ),
      Errno.success,
    );
    assertEquals(
      Size.cast(memory, new Pointer(0)),
      new Size(Dirent.size + 10),
    );
    assertEquals(
      Dirent.cast(memory, new Pointer(200), 0),
      new Dirent({
        d_next: new Dircookie(3n),
        d_ino: new Inode(dir.children[2].id.value),
        d_namlen: new Dirnamlen(10),
        d_type: new Filetype(Filetype.regular_file),
      }),
    );
    assertEquals(
      decoder.decode(new Uint8Array(memory.buffer, 224, 10)),
      "test_file3",
    );

    assertEquals(
      fd_readdir(
        fd.value,
        toPointer(200),
        toValue(100),
        toBigValue(3n),
        toPointer(0),
      ),
      Errno.success,
    );
    assertEquals(
      Size.cast(memory, new Pointer(0)),
      new Size(0),
    );
  });
});

Deno.test("fd_close", async (t) => {
  await t.step("success", () => {
    const fd = FS.open(
      new FS.File({
        name: new FS.FileName("test_file"),
        type: FS.File.type.regularFile,
      }),
      Fdflags.zero(),
    );

    assertEquals(
      fd_close(fd.value),
      Errno.success,
    );

    assertEquals(
      FS.findByFd(fd),
      undefined,
    );
  });
});

Deno.test("fd_read", async (t) => {
  await t.step("success", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    const fd = FS.open(
      new FS.File({
        name: new FS.FileName("test_file.txt"),
        type: FS.File.type.regularFile,
        content: new FS.FileContent("File Content\n"),
      }),
      Fdflags.zero(),
    );

    new Iovec({
      buf: new Pointer(256),
      buf_len: new Size(64),
    }).store(memory, new Pointer(128));

    assertEquals(
      fd_read(fd.value, toPointer(128), new Size(1).value, toPointer(0)),
      Errno.success,
    );
    assertEquals(
      Size.cast(memory, new Pointer(0)),
      new Size(13),
    );
    assertEquals(
      decoder.decode(new Uint8Array(memory.buffer, 256, 13)),
      "File Content\n",
    );

    assertEquals(
      fd_read(fd.value, toPointer(128), new Size(1).value, toPointer(0)),
      Errno.success,
    );
    assertEquals(
      Size.cast(memory, new Pointer(0)),
      new Size(0),
    );
  });
});

Deno.test("path_filestat_get", async (t) => {
  await t.step("fd=root(/), path=home", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    encoder.encodeInto("home", new Uint8Array(memory.buffer, 64, 4));

    assertEquals(
      path_filestat_get(
        Fd.root,
        toValue(0),
        toPointer(64),
        new Size(4).value,
        toPointer(128),
      ),
      Errno.success,
    );
    assertEquals(
      Filestat.cast(memory, new Pointer(128)),
      FS.find("/home")!.wasi_filestat(),
    );
  });
});

Deno.test("fd_prestat_dir_name", async (t) => {
  await t.step("home", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    assertEquals(
      fd_prestat_dir_name(
        Fd.home,
        toValue(64),
        new Size("/home/kawaii/".length).value,
      ),
      Errno.success,
    );
    assertEquals(
      decoder.decode(new Uint8Array(memory.buffer, 64, "/home/kawaii/".length)),
      "/home/kawaii/",
    );
  });
});

Deno.test("path_open", async (t) => {
  await t.step("fd=root(/), path=(/home/kawaii)", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    encoder.encodeInto(
      "/home/kawaii",
      new Uint8Array(memory.buffer, 64, "/home/kawaii".length),
    );

    assertEquals(
      path_open(
        Fd.root,
        toValue(0),
        toPointer(64),
        toValue("/home/kawaii".length),
        new Oflags(0).value,
        toBigValue(0n),
        toBigValue(0n),
        toValue(0),
        toPointer(128),
      ),
      Errno.success,
    );

    console.debug(Fd.cast(memory, new Pointer(128)));

    assertEquals(
      FS.findByFd(Fd.cast(memory, new Pointer(128))),
      new FS.FileState({ file: FS.File.home, wasi_fdflags: Fdflags.zero() }),
    );
    FS.closeByFd(Fd.cast(memory, new Pointer(128)));
  });

  await t.step("oflags=creat|excl", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    init({ memory });

    const filename = "test.path_open.oflags.create";

    encoder.encodeInto(
      filename,
      new Uint8Array(memory.buffer, 64, filename.length),
    );

    // 1st
    assertEquals(
      path_open(
        Fd.home,
        toValue(0),
        toPointer(64),
        toValue(filename.length),
        new Oflags(Oflags.creat | Oflags.excl).value,
        toBigValue(0n),
        toBigValue(0n),
        toValue(0),
        toPointer(128),
      ),
      Errno.success,
    );

    // 2nd
    assertEquals(
      path_open(
        Fd.home,
        toValue(0),
        toPointer(64),
        toValue(filename.length),
        new Oflags(Oflags.creat | Oflags.excl).value,
        toBigValue(0n),
        toBigValue(0n),
        toValue(0),
        toPointer(128),
      ),
      Errno.exist,
    );

    const fd = Fd.cast(memory, new Pointer(128));

    assertEquals(
      FS.findByFd(fd),
      new FS.FileState({
        file: FS.find(`/home/kawaii/${filename}`)!,
        wasi_fdflags: Fdflags.zero(),
      }),
    );
    FS.closeByFd(fd);
  });
});
