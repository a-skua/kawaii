import { assertEquals } from "assert";
import {
  BigValue,
  Ciovec,
  Clockid,
  Data,
  Device,
  Dircookie,
  Errno,
  Event,
  EventFdReadwrite,
  Eventrwflags,
  Eventtype,
  Fd,
  Fdflags,
  Fdstat,
  Filesize,
  Filestat,
  Filetype,
  Inode,
  Iovec,
  Linkcount,
  Lookupflags,
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

const toPointer = <T extends Data<string>>(p: number): Pointer<T> =>
  p as Pointer<T>;

const toValue = <T extends Data<string>>(v: number): Value<T> => v as Value<T>;

const toBigValue = <T extends Data<string>>(v: bigint): BigValue<T> =>
  v as BigValue<T>;

interface DataType {
  alignment: number;
}

const randomPointer = <T extends Data<string>>(
  { alignment }: DataType,
): Pointer<T> => {
  const random = Math.floor(Math.random() * (1024 / alignment));
  return toPointer(random * alignment);
};

const addOffset = <T extends Data<string>>(
  pointer: Pointer<T>,
  offset: number,
): Pointer<T> => toPointer(pointer + offset);

Deno.test("iovec", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Iovec);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint32(addOffset(pointer, offset), pointer, true);
    data.setUint32(addOffset(pointer, offset + 4), 16, true);

    assertEquals(
      Iovec.cast(memory, toPointer(pointer), offset),
      new Iovec({
        buf: toPointer(pointer),
        buf_len: new Size(toValue(16)),
      }),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Iovec);
    const offset = 8;

    const iovec = new Iovec({
      buf: toPointer(100),
      buf_len: new Size(toValue(32)),
    });
    iovec.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Iovec.size),
      new Uint8Array([
        // buf
        ...[100, 0, 0, 0],
        // len
        ...[32, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("ciovec", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Ciovec);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint32(addOffset(pointer, offset), pointer, true);
    data.setUint32(addOffset(pointer, offset + 4), 16, true);

    assertEquals(
      Ciovec.cast(memory, toPointer(pointer), offset),
      new Ciovec({
        buf: toPointer(pointer),
        buf_len: new Size(toValue(16)),
      }),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Ciovec);
    const offset = 8;

    const iovec = new Ciovec({
      buf: toPointer(100),
      buf_len: new Size(toValue(32)),
    });
    iovec.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Ciovec.size),
      new Uint8Array([
        // buf
        ...[100, 0, 0, 0],
        // len
        ...[32, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("eventrwflags", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Eventrwflags);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint16(addOffset(pointer, offset), 1, true);

    assertEquals(
      Eventrwflags.cast(memory, toPointer(pointer), offset),
      new Eventrwflags(toValue(1)),
    );
  });

  await t.step("sotre()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Eventrwflags);
    const offset = 8;

    const flags = new Eventrwflags(Eventrwflags.fd_readwrite_hangup);
    flags.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(
        memory.buffer,
        addOffset(pointer, offset),
        Eventrwflags.size,
      ),
      new Uint8Array([1, 0]),
    );
  });

  await t.step("fd_readwrite_hangup is true", () => {
    const flags = new Eventrwflags(toValue(1));
    assertEquals(flags.fd_readwrite_hangup, true);
  });

  await t.step("fd_readwrite_hangup is false", () => {
    const flags = new Eventrwflags(toValue(0));
    assertEquals(flags.fd_readwrite_hangup, false);
  });
});

Deno.test("event_fd_readwrite", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(EventFdReadwrite);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 1024n, true);
    data.setUint16(addOffset(pointer, offset + 8), 1, true);

    assertEquals(
      EventFdReadwrite.cast(memory, toPointer(pointer), offset),
      new EventFdReadwrite({
        nbytes: new Filesize(toBigValue(1024n)),
        flags: new Eventrwflags(toValue(1)),
      }),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(EventFdReadwrite);
    const offset = 8;

    const content = new EventFdReadwrite({
      nbytes: new Filesize(toBigValue(128n)),
      flags: new Eventrwflags(Eventrwflags.fd_readwrite_hangup),
    });
    content.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(
        memory.buffer,
        addOffset(pointer, offset),
        EventFdReadwrite.size,
      ),
      new Uint8Array([
        // nbytes
        ...[128, 0, 0, 0, 0, 0, 0, 0],
        // flags
        ...[1, 0, 0, 0, 0, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("eventtype", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Event);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint8(addOffset(pointer, offset), 1);

    assertEquals(
      Eventtype.cast(memory, toPointer(pointer), offset),
      new Eventtype(Eventtype.fd_read),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Event);
    const offset = 8;

    const type = new Eventtype(Eventtype.fd_write);
    type.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Eventtype.size),
      new Uint8Array([2]),
    );
  });

  await t.step("clock", () => {
    const type = new Eventtype(Eventtype.clock);

    assertEquals(type.clock, true);
  });

  await t.step("fd_read", () => {
    const type = new Eventtype(Eventtype.fd_read);

    assertEquals(type.fd_read, true);
  });

  await t.step("fd_write", () => {
    const type = new Eventtype(Eventtype.fd_write);

    assertEquals(type.fd_write, true);
  });
});

Deno.test("event", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Event);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 100n, true);
    data.setUint16(addOffset(pointer, offset + 8), Errno.notsup, true);
    data.setUint8(addOffset(pointer, offset + 10), Eventtype.fd_write);
    data.setBigUint64(addOffset(pointer, offset + 16), 1024n, true);
    data.setUint16(addOffset(pointer, offset + 24), 1, true);

    assertEquals(
      Event.cast(memory, toPointer(pointer), offset),
      new Event({
        userdata: new Userdata(toBigValue(100n)),
        error: new Errno(Errno.notsup),
        type: new Eventtype(Eventtype.fd_write),
        fd_readwrite: new EventFdReadwrite({
          nbytes: new Filesize(toBigValue(1024n)),
          flags: new Eventrwflags(toValue(1)),
        }),
      }),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Event);
    const offset = 8;

    const event = new Event({
      userdata: new Userdata(toBigValue(100n)),
      error: new Errno(Errno.notsup),
      type: new Eventtype(Eventtype.fd_write),
      fd_readwrite: new EventFdReadwrite({
        nbytes: new Filesize(toBigValue(128n)),
        flags: new Eventrwflags(Eventrwflags.fd_readwrite_hangup),
      }),
    });
    event.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Event.size),
      new Uint8Array([
        // userdata
        ...[100, 0, 0, 0, 0, 0, 0, 0],
        // error
        ...[58, 0],
        // type
        ...[2, 0, 0, 0, 0, 0],
        // fd_readwrite.nbytes
        ...[128, 0, 0, 0, 0, 0, 0, 0],
        // fd_readwrite.flags
        ...[1, 0, 0, 0, 0, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("fdflags", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Fdflags);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint16(
      addOffset(pointer, offset),
      Fdflags.dsync | Fdflags.rsync,
      true,
    );

    assertEquals(
      Fdflags.cast(memory, toPointer(pointer), offset),
      new Fdflags(toValue(10)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Fdflags);
    const offset = 8;

    const flags = new Fdflags(Fdflags.sync);
    flags.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Fdflags.size),
      new Uint8Array([16, 0]),
    );
  });

  await t.step("append", () => {
    const flags = new Fdflags(toValue(Fdflags.append));
    assertEquals(flags.append, true);
  });

  await t.step("dsync", () => {
    const flags = new Fdflags(toValue(Fdflags.dsync));
    assertEquals(flags.dsync, true);
  });

  await t.step("nonblock", () => {
    const flags = new Fdflags(toValue(Fdflags.nonblock));
    assertEquals(flags.nonblock, true);
  });

  await t.step("rsync", () => {
    const flags = new Fdflags(toValue(Fdflags.rsync));
    assertEquals(flags.rsync, true);
  });

  await t.step("sync", () => {
    const flags = new Fdflags(toValue(Fdflags.sync));
    assertEquals(flags.sync, true);
  });
});

Deno.test("rights", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Rights);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 1_000_000n, true);
    assertEquals(
      Rights.cast(memory, toPointer(pointer), offset),
      new Rights(toBigValue(1_000_000n)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Rights);
    const offset = 8;

    const rights = new Rights(Rights.fd_write);
    rights.store(memory, toPointer(pointer), offset);
    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Rights.size),
      new Uint8Array([64, 0, 0, 0, 0, 0, 0, 0]),
    );
  });

  await t.step("fd_datasync", () => {
    const flags = new Rights(Rights.fd_datasync);
    assertEquals(flags.fd_datasync, true);
  });

  await t.step("fd_read", () => {
    const flags = new Rights(Rights.fd_read);
    assertEquals(flags.fd_read, true);
  });

  await t.step("fd_seek", () => {
    const flags = new Rights(Rights.fd_seek);
    assertEquals(flags.fd_seek, true);
  });

  await t.step("fd_fdstat_set_flags", () => {
    const flags = new Rights(Rights.fd_fdstat_set_flags);
    assertEquals(flags.fd_fdstat_set_flags, true);
  });

  await t.step("fd_sync", () => {
    const flags = new Rights(Rights.fd_sync);
    assertEquals(flags.fd_sync, true);
  });

  await t.step("fd_tell", () => {
    const flags = new Rights(Rights.fd_tell);
    assertEquals(flags.fd_tell, true);
  });

  await t.step("fd_write", () => {
    const flags = new Rights(Rights.fd_write);
    assertEquals(flags.fd_write, true);
  });

  await t.step("fd_advise", () => {
    const flags = new Rights(Rights.fd_advise);
    assertEquals(flags.fd_advise, true);
  });

  await t.step("fd_allocate", () => {
    const flags = new Rights(Rights.fd_allocate);
    assertEquals(flags.fd_allocate, true);
  });

  await t.step("path_create_directory", () => {
    const flags = new Rights(Rights.path_create_directory);
    assertEquals(flags.path_create_directory, true);
  });

  await t.step("path_create_file", () => {
    const flags = new Rights(Rights.path_create_file);
    assertEquals(flags.path_create_file, true);
  });

  await t.step("path_link_source", () => {
    const flags = new Rights(Rights.path_link_source);
    assertEquals(flags.path_link_source, true);
  });

  await t.step("path_link_target", () => {
    const flags = new Rights(Rights.path_link_target);
    assertEquals(flags.path_link_target, true);
  });

  await t.step("path_open", () => {
    const flags = new Rights(Rights.path_open);
    assertEquals(flags.path_open, true);
  });

  await t.step("fd_readdir", () => {
    const flags = new Rights(Rights.fd_readdir);
    assertEquals(flags.fd_readdir, true);
  });

  await t.step("path_readlink", () => {
    const flags = new Rights(Rights.path_readlink);
    assertEquals(flags.path_readlink, true);
  });

  await t.step("path_rename_source", () => {
    const flags = new Rights(Rights.path_rename_source);
    assertEquals(flags.path_rename_source, true);
  });

  await t.step("path_rename_target", () => {
    const flags = new Rights(Rights.path_rename_target);
    assertEquals(flags.path_rename_target, true);
  });

  await t.step("path_filestat_get", () => {
    const flags = new Rights(Rights.path_filestat_get);
    assertEquals(flags.path_filestat_get, true);
  });

  await t.step("path_filestat_set_size", () => {
    const flags = new Rights(Rights.path_filestat_set_size);
    assertEquals(flags.path_filestat_set_size, true);
  });

  await t.step("path_filestat_set_times", () => {
    const flags = new Rights(Rights.path_filestat_set_times);
    assertEquals(flags.path_filestat_set_times, true);
  });

  await t.step("fd_filestat_get", () => {
    const flags = new Rights(Rights.fd_filestat_get);
    assertEquals(flags.fd_filestat_get, true);
  });

  await t.step("fd_filestat_set_size", () => {
    const flags = new Rights(Rights.fd_filestat_set_size);
    assertEquals(flags.fd_filestat_set_size, true);
  });

  await t.step("fd_filestat_set_times", () => {
    const flags = new Rights(Rights.fd_filestat_set_times);
    assertEquals(flags.fd_filestat_set_times, true);
  });

  await t.step("path_symlink", () => {
    const flags = new Rights(Rights.path_symlink);
    assertEquals(flags.path_symlink, true);
  });

  await t.step("path_remove_directory", () => {
    const flags = new Rights(Rights.path_remove_directory);
    assertEquals(flags.path_remove_directory, true);
  });

  await t.step("path_unlink_file", () => {
    const flags = new Rights(Rights.path_unlink_file);
    assertEquals(flags.path_unlink_file, true);
  });

  await t.step("poll_fd_readwrite", () => {
    const flags = new Rights(Rights.poll_fd_readwrite);
    assertEquals(flags.poll_fd_readwrite, true);
  });

  await t.step("sock_shutdown", () => {
    const flags = new Rights(Rights.sock_shutdown);
    assertEquals(flags.sock_shutdown, true);
  });

  await t.step("sock_accept", () => {
    const flags = new Rights(Rights.sock_accept);
    assertEquals(flags.sock_accept, true);
  });
});

Deno.test("filetype", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Filetype);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint8(addOffset(pointer, offset), Filetype.character_device);

    assertEquals(
      Filetype.cast(memory, toPointer(pointer), offset),
      new Filetype(Filetype.character_device),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Filetype);
    const offset = 8;

    const filetype = new Filetype(toValue(100));
    filetype.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Filetype.size),
      new Uint8Array([100]),
    );
  });

  await t.step("unknown", () => {
    const type = new Filetype(Filetype.unknown);

    assertEquals(type.unknown, true);
  });

  await t.step("block_device", () => {
    const type = new Filetype(Filetype.block_device);

    assertEquals(type.block_device, true);
  });

  await t.step("character_device", () => {
    const type = new Filetype(Filetype.character_device);

    assertEquals(type.character_device, true);
  });

  await t.step("directory", () => {
    const type = new Filetype(Filetype.directory);

    assertEquals(type.directory, true);
  });

  await t.step("regular_file", () => {
    const type = new Filetype(Filetype.regular_file);

    assertEquals(type.regular_file, true);
  });

  await t.step("socket_dgram", () => {
    const type = new Filetype(Filetype.socket_dgram);

    assertEquals(type.socket_dgram, true);
  });

  await t.step("socket_stream", () => {
    const type = new Filetype(Filetype.socket_stream);

    assertEquals(type.socket_stream, true);
  });

  await t.step("symbolic_link", () => {
    const type = new Filetype(Filetype.symbolic_link);

    assertEquals(type.symbolic_link, true);
  });
});

Deno.test("fdstat", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Fdstat);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint8(addOffset(pointer, offset), Filetype.character_device);
    data.setUint16(addOffset(pointer, offset + 2), Fdflags.nonblock, true);
    data.setBigUint64(addOffset(pointer, offset + 8), Rights.fd_write, true);
    data.setBigUint64(addOffset(pointer, offset + 16), Rights.fd_write, true);

    assertEquals(
      Fdstat.cast(memory, toPointer(pointer), offset),
      new Fdstat({
        fs_filetype: new Filetype(Filetype.character_device),
        fs_flags: new Fdflags(Fdflags.nonblock),
        fs_rights_base: new Rights(Rights.fd_write),
        fs_rights_inheriting: new Rights(Rights.fd_write),
      }),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Fdstat);
    const offset = 8;

    const fdstat = new Fdstat({
      fs_filetype: new Filetype(Filetype.character_device),
      fs_flags: new Fdflags(Fdflags.nonblock),
      fs_rights_base: new Rights(Rights.fd_write),
      fs_rights_inheriting: new Rights(Rights.fd_write),
    });
    fdstat.store(memory, toPointer(pointer), offset);
    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Fdstat.size),
      new Uint8Array([
        // fs_filetype
        ...[2, 0],
        // fd_flags,
        ...[4, 0, 0, 0, 0, 0],
        // fs_rights_base
        ...[64, 0, 0, 0, 0, 0, 0, 0],
        // fs_rights_inheriting
        ...[64, 0, 0, 0, 0, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("preopentype", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Preopentype);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint8(addOffset(pointer, offset), 1);

    assertEquals(
      Preopentype.cast(memory, toPointer(pointer), offset),
      new Preopentype(toValue(1)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Preopentype);
    const offset = 8;

    const opentype = new Preopentype(toValue(1));
    opentype.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(
        memory.buffer,
        addOffset(pointer, offset),
        Preopentype.size,
      ),
      new Uint8Array([1]),
    );
  });
});

Deno.test("prestat_dir", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(PrestatDir);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint32(addOffset(pointer, offset), 16, true);

    assertEquals(
      PrestatDir.cast(memory, toPointer(pointer), offset),
      new PrestatDir({ pr_name_len: new Size(toValue(16)) }),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer<PrestatDir>(PrestatDir);
    const offset = 8;

    const prestat = new PrestatDir({
      pr_name_len: new Size(toValue(16)),
    });
    prestat.store(memory, pointer, offset);

    assertEquals(
      new Uint8Array(
        memory.buffer,
        addOffset(pointer, offset),
        PrestatDir.size,
      ),
      new Uint8Array([
        ...[16, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("prestat", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Prestat);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint8(addOffset(pointer, offset), 1);
    data.setUint32(addOffset(pointer, offset + 4), 16, true);

    assertEquals(
      Prestat.cast(memory, toPointer(pointer), offset),
      new Prestat({
        type: new Preopentype(toValue(1)),
        content: new PrestatDir({ pr_name_len: new Size(toValue(16)) }),
      }),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Prestat);
    const offset = 8;

    const stat = new Prestat({
      type: new Preopentype(toValue(1)),
      content: new PrestatDir({ pr_name_len: new Size(toValue(16)) }),
    });
    stat.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Prestat.size),
      new Uint8Array([
        ...[1, 0, 0, 0],
        ...[16, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("userdata", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Userdata);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 1n, true);

    assertEquals(
      Userdata.cast(memory, toPointer(pointer), offset),
      new Userdata(toBigValue(1n)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Userdata);
    const offset = 8;

    const data = new Userdata(toBigValue(1n));
    data.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Userdata.size),
      new Uint8Array([
        ...[1, 0, 0, 0, 0, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("size", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Size);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint32(addOffset(pointer, offset), 1024, true);

    assertEquals(
      Size.cast(memory, toPointer(pointer), offset),
      new Size(toValue(1024)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Size);
    const offset = 8;

    const size = new Size(toValue(128));
    size.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Size.size),
      new Uint8Array([128, 0, 0, 0]),
    );
  });
});

Deno.test("filesize", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Filesize);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 1024n, true);

    assertEquals(
      Filesize.cast(memory, toPointer(pointer), offset),
      new Filesize(toBigValue(1024n)),
    );
  });
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Filesize);
    const offset = 8;

    const size = new Filesize(toBigValue(128n));
    size.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Filesize.size),
      new Uint8Array([128, 0, 0, 0, 0, 0, 0, 0]),
    );
  });
});

Deno.test("timestamp", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Timestamp);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 100n, true);

    assertEquals(
      Timestamp.cast(memory, toPointer(pointer), offset),
      new Timestamp(toBigValue(100n)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Timestamp);
    const offset = 8;

    const timestamp = new Timestamp(toBigValue(100n));
    timestamp.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Timestamp.size),
      new Uint8Array([100, 0, 0, 0, 0, 0, 0, 0]),
    );
  });

  await t.step("realtime", () => {
    assertEquals(
      Timestamp.realtime(),
      new Timestamp(
        BigInt(new Date().getTime()) * 1_000_000n as BigValue<Timestamp>,
      ),
    );
  });

  await t.step("monotonic", () => {
    assertEquals(
      Timestamp.monotonic(),
      new Timestamp(
        BigInt(performance.now()) * 1_000_000n as BigValue<Timestamp>,
      ),
    );
  });
});

Deno.test("clockid", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Clockid);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint32(addOffset(pointer, offset), Clockid.monotonic, true);

    assertEquals(
      Clockid.cast(memory, toPointer(pointer), offset),
      new Clockid(Clockid.monotonic),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Clockid);
    const offset = 8;

    const clockid = new Clockid(Clockid.monotonic);
    clockid.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Clockid.size),
      new Uint8Array([1, 0, 0, 0]),
    );
  });

  await t.step("realtime", () => {
    const clockid = new Clockid(Clockid.realtime);

    assertEquals(
      clockid.realtime,
      true,
    );
  });

  await t.step("monotonic", () => {
    const clockid = new Clockid(Clockid.monotonic);

    assertEquals(
      clockid.monotonic,
      true,
    );
  });

  await t.step("process_cputime_id", () => {
    const clockid = new Clockid(Clockid.process_cputime_id);

    assertEquals(
      clockid.process_cputime_id,
      true,
    );
  });

  await t.step("thread_cputime_id", () => {
    const clockid = new Clockid(Clockid.thread_cputime_id);

    assertEquals(
      clockid.thread_cputime_id,
      true,
    );
  });
});

Deno.test("subclockflags", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Subclockflags);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint16(addOffset(pointer, offset), 1, true);

    assertEquals(
      Subclockflags.cast(memory, toPointer(pointer), offset),
      new Subclockflags(toValue(1)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Subclockflags);
    const offset = 8;

    const flags = new Subclockflags(toValue(1));
    flags.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(
        memory.buffer,
        addOffset(pointer, offset),
        Subclockflags.size,
      ),
      new Uint8Array([1, 0]),
    );
  });

  await t.step("subscription_clock_abstime", () => {
    const flags = new Subclockflags(
      toValue(Subclockflags.subscription_clock_abstime),
    );
    assertEquals(
      flags.subscription_clock_abstime,
      true,
    );
  });
});

Deno.test("subscription_clock", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(SubscriptionClock);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint32(addOffset(pointer, offset), 2);
    data.setBigUint64(addOffset(pointer, offset + 8), 100n);
    data.setBigUint64(addOffset(pointer, offset + 16), 200n);
    data.setUint16(addOffset(pointer, offset + 24), 1);
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(SubscriptionClock);
    const offset = 8;

    const clock = new SubscriptionClock({
      id: new Clockid(Clockid.process_cputime_id),
      timeout: new Timestamp(toBigValue(100n)),
      precision: new Timestamp(toBigValue(200n)),
      flags: new Subclockflags(Subclockflags.subscription_clock_abstime),
    });
    clock.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(
        memory.buffer,
        addOffset(pointer, offset),
        SubscriptionClock.size,
      ),
      new Uint8Array([
        // id
        ...[2, 0, 0, 0, 0, 0, 0, 0],
        // timeout
        ...[100, 0, 0, 0, 0, 0, 0, 0],
        // precision
        ...[200, 0, 0, 0, 0, 0, 0, 0],
        // flags
        ...[1, 0, 0, 0, 0, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("fd", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Fd);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint32(addOffset(pointer, offset), 1, true);

    assertEquals(
      Fd.cast(memory, toPointer(pointer), offset),
      new Fd(toValue(1)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Fd);
    const offset = 8;

    const fd = new Fd(Fd.stdout);
    fd.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Fd.size),
      new Uint8Array([1, 0, 0, 0]),
    );
  });
});

Deno.test("subscription_fd_readwrite", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(SubscriptionFdReadwrite);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint32(addOffset(pointer, offset), 1, true);

    assertEquals(
      SubscriptionFdReadwrite.cast(memory, toPointer(pointer), offset),
      new SubscriptionFdReadwrite({
        fd: new Fd(Fd.stdout),
      }),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(SubscriptionFdReadwrite);
    const offset = 8;

    const rw = new SubscriptionFdReadwrite({
      fd: new Fd(Fd.stdout),
    });
    rw.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(
        memory.buffer,
        addOffset(pointer, offset),
        SubscriptionFdReadwrite.size,
      ),
      new Uint8Array([1, 0, 0, 0]),
    );
  });
});

Deno.test("subscription_u", async (t) => {
  await t.step("cast()", async (t) => {
    await t.step("eventtype is fd_write", () => {
      const memory = new WebAssembly.Memory({ initial: 1 });
      const pointer = randomPointer(SubscriptionFdReadwrite);
      const offset = 8;

      const data = new DataView(memory.buffer);
      data.setUint8(addOffset(pointer, offset), 2);
      data.setUint32(addOffset(pointer, offset + 8), 5, true);

      assertEquals(
        SubscriptionU.cast(memory, toPointer(pointer), offset),
        new SubscriptionU({
          type: new Eventtype(Eventtype.fd_write),
          content: new SubscriptionFdReadwrite({
            fd: new Fd(toValue(5)),
          }),
        }),
      );
    });

    await t.step("eventtype is clock", () => {
      const memory = new WebAssembly.Memory({ initial: 1 });
      const pointer = randomPointer(SubscriptionFdReadwrite);
      const offset = 8;

      const data = new DataView(memory.buffer);
      data.setUint8(addOffset(pointer, offset), 0);
      data.setUint32(addOffset(pointer, offset + 8), 3, true);
      data.setBigUint64(addOffset(pointer, offset + 16), 100n, true);
      data.setBigUint64(addOffset(pointer, offset + 24), 200n, true);
      data.setUint16(addOffset(pointer, offset + 32), 1, true);

      assertEquals(
        SubscriptionU.cast(memory, toPointer(pointer), offset),
        new SubscriptionU({
          type: new Eventtype(Eventtype.clock),
          content: new SubscriptionClock({
            id: new Clockid(Clockid.thread_cputime_id),
            timeout: new Timestamp(toBigValue(100n)),
            precision: new Timestamp(toBigValue(200n)),
            flags: new Subclockflags(Subclockflags.subscription_clock_abstime),
          }),
        }),
      );
    });
  });

  await t.step("store()", async (t) => {
    await t.step("eventtype is fd_write", () => {
      const memory = new WebAssembly.Memory({ initial: 1 });
      const pointer = randomPointer(SubscriptionFdReadwrite);
      const offset = 8;

      const u = new SubscriptionU({
        type: new Eventtype(Eventtype.fd_write),
        content: new SubscriptionFdReadwrite({
          fd: new Fd(toValue(5)),
        }),
      });
      u.store(memory, toPointer(pointer), offset);

      assertEquals(
        new Uint8Array(
          memory.buffer,
          addOffset(pointer, offset),
          SubscriptionU.size,
        ),
        new Uint8Array([
          // type
          ...[2, 0, 0, 0, 0, 0, 0, 0],
          // content
          ...[5, 0, 0, 0, 0, 0, 0, 0],
          ...[0, 0, 0, 0, 0, 0, 0, 0],
          ...[0, 0, 0, 0, 0, 0, 0, 0],
          ...[0, 0, 0, 0, 0, 0, 0, 0],
        ]),
      );
    });

    await t.step("eventtype is clock", () => {
      const memory = new WebAssembly.Memory({ initial: 1 });
      const pointer = randomPointer(SubscriptionFdReadwrite);
      const offset = 8;

      const u = new SubscriptionU({
        type: new Eventtype(Eventtype.clock),
        content: new SubscriptionClock({
          id: new Clockid(Clockid.thread_cputime_id),
          timeout: new Timestamp(toBigValue(100n)),
          precision: new Timestamp(toBigValue(200n)),
          flags: new Subclockflags(Subclockflags.subscription_clock_abstime),
        }),
      });
      u.store(memory, toPointer(pointer), offset);

      assertEquals(
        new Uint8Array(
          memory.buffer,
          addOffset(pointer, offset),
          SubscriptionU.size,
        ),
        new Uint8Array([
          // type
          ...[0, 0, 0, 0, 0, 0, 0, 0],
          // content
          ...[3, 0, 0, 0, 0, 0, 0, 0],
          ...[100, 0, 0, 0, 0, 0, 0, 0],
          ...[200, 0, 0, 0, 0, 0, 0, 0],
          ...[1, 0, 0, 0, 0, 0, 0, 0],
        ]),
      );
    });
  });
});

Deno.test("subscription", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Subscription);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 100n, true);
    data.setUint8(addOffset(pointer, offset + 8), 2);
    data.setUint32(addOffset(pointer, offset + 16), 5, true);

    assertEquals(
      Subscription.cast(memory, toPointer(pointer), offset),
      new Subscription({
        userdata: new Userdata(toBigValue(100n)),
        u: new SubscriptionU({
          type: new Eventtype(Eventtype.fd_write),
          content: new SubscriptionFdReadwrite({
            fd: new Fd(toValue(5)),
          }),
        }),
      }),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Subscription);
    const offset = 8;

    const subscription = new Subscription({
      userdata: new Userdata(toBigValue(100n)),
      u: new SubscriptionU({
        type: new Eventtype(Eventtype.fd_write),
        content: new SubscriptionFdReadwrite({
          fd: new Fd(toValue(5)),
        }),
      }),
    });
    subscription.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(
        memory.buffer,
        addOffset(pointer, offset),
        Subscription.size,
      ),
      new Uint8Array([
        // userdata
        ...[100, 0, 0, 0, 0, 0, 0, 0],
        // u.type
        ...[2, 0, 0, 0, 0, 0, 0, 0],
        // u.content
        ...[5, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("errno", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Errno);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint16(addOffset(pointer, offset), 8, true);

    assertEquals(
      Errno.cast(memory, toPointer(pointer), offset),
      new Errno(Errno.badf),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Errno);
    const offset = 8;

    const errno = new Errno(Errno.badf);
    errno.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Errno.size),
      new Uint8Array([8, 0]),
    );
  });
});

Deno.test("dircookie", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Errno);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 1024n, true);

    assertEquals(
      Dircookie.cast(memory, toPointer(pointer), offset),
      new Dircookie(toBigValue(1024n)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Errno);
    const offset = 8;

    const cookie = new Dircookie(toBigValue(100n));
    cookie.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Dircookie.size),
      new Uint8Array([100, 0, 0, 0, 0, 0, 0, 0]),
    );
  });
});

Deno.test("lookupflags", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Errno);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint32(
      addOffset(pointer, offset),
      Lookupflags.symlink_follow,
      true,
    );

    assertEquals(
      Lookupflags.cast(memory, toPointer(pointer), offset),
      new Lookupflags(toValue(1)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Errno);
    const offset = 8;

    const flags = new Lookupflags(toValue(1));
    flags.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(
        memory.buffer,
        addOffset(pointer, offset),
        Lookupflags.size,
      ),
      new Uint8Array([1, 0, 0, 0]),
    );
  });

  await t.step("symlink_follow", () => {
    const flags = new Lookupflags(Lookupflags.symlink_follow);

    assertEquals(
      flags.symlink_follow,
      true,
    );
  });
});

Deno.test("device", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Errno);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 1024n, true);

    assertEquals(
      Device.cast(memory, toPointer(pointer), offset),
      new Device(toBigValue(1024n)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Errno);
    const offset = 8;

    const device = new Device(toBigValue(128n));
    device.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(
        memory.buffer,
        addOffset(pointer, offset),
        Device.size,
      ),
      new Uint8Array([128, 0, 0, 0, 0, 0, 0, 0]),
    );
  });
});

Deno.test("inode", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Inode);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 1024n, true);

    assertEquals(
      Inode.cast(memory, toPointer(pointer), offset),
      new Inode(toBigValue(1024n)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Inode);
    const offset = 8;

    const inode = new Inode(toBigValue(128n));
    inode.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(
        memory.buffer,
        addOffset(pointer, offset),
        Inode.size,
      ),
      new Uint8Array([128, 0, 0, 0, 0, 0, 0, 0]),
    );
  });
});

Deno.test("linkcount", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Linkcount);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 1024n, true);

    assertEquals(
      Linkcount.cast(memory, toPointer(pointer), offset),
      new Linkcount(toBigValue(1024n)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Linkcount);
    const offset = 8;

    const linkcount = new Linkcount(toBigValue(128n));
    linkcount.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(
        memory.buffer,
        addOffset(pointer, offset),
        Linkcount.size,
      ),
      new Uint8Array([128, 0, 0, 0, 0, 0, 0, 0]),
    );
  });
});

Deno.test("filestat", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Filestat);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 1024n, true);
    data.setBigUint64(addOffset(pointer, offset + 8), 2048n, true);
    data.setUint8(addOffset(pointer, offset + 16), 2);
    data.setBigUint64(addOffset(pointer, offset + 24), 10n, true);
    data.setBigUint64(addOffset(pointer, offset + 32), 4096n, true);
    data.setBigUint64(addOffset(pointer, offset + 40), 1705256117684n, true);
    data.setBigUint64(addOffset(pointer, offset + 48), 1705256117685n, true);
    data.setBigUint64(addOffset(pointer, offset + 56), 1705256117686n, true);

    assertEquals(
      Filestat.cast(memory, toPointer(pointer), offset),
      new Filestat({
        dev: new Device(toBigValue(1024n)),
        ino: new Inode(toBigValue(2048n)),
        filetype: new Filetype(Filetype.character_device),
        nlink: new Linkcount(toBigValue(10n)),
        size: new Filesize(toBigValue(4096n)),
        atim: new Timestamp(toBigValue(1705256117684n)),
        mtim: new Timestamp(toBigValue(1705256117685n)),
        ctim: new Timestamp(toBigValue(1705256117686n)),
      }),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Filestat);
    const offset = 8;

    const stat = new Filestat({
      dev: new Device(toBigValue(32n)),
      ino: new Inode(toBigValue(64n)),
      filetype: new Filetype(Filetype.character_device),
      nlink: new Linkcount(toBigValue(10n)),
      size: new Filesize(toBigValue(128n)),
      atim: new Timestamp(toBigValue(11n)),
      mtim: new Timestamp(toBigValue(12n)),
      ctim: new Timestamp(toBigValue(13n)),
    });
    stat.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Filestat.size),
      new Uint8Array([
        // dev
        ...[32, 0, 0, 0, 0, 0, 0, 0],
        // ino
        ...[64, 0, 0, 0, 0, 0, 0, 0],
        // filetype
        ...[2, 0, 0, 0, 0, 0, 0, 0],
        // nlink
        ...[10, 0, 0, 0, 0, 0, 0, 0],
        // size
        ...[128, 0, 0, 0, 0, 0, 0, 0],
        // atim
        ...[11, 0, 0, 0, 0, 0, 0, 0],
        // mtim
        ...[12, 0, 0, 0, 0, 0, 0, 0],
        // ctim
        ...[13, 0, 0, 0, 0, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("oflags", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Errno);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint16(addOffset(pointer, offset), 1, true);
    data.setUint16(addOffset(pointer, offset + 2), 1, true);

    assertEquals(
      Oflags.cast(memory, toPointer(pointer), offset),
      new Oflags(toValue(1)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Errno);
    const offset = 8;

    const flags = new Oflags(Oflags.directory);
    flags.store(memory, toPointer(pointer), offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), Oflags.size),
      new Uint8Array([2, 0]),
    );
  });

  await t.step("creat", () => {
    const flags = new Oflags(Oflags.creat);

    assertEquals(flags.creat, true);
  });

  await t.step("directory", () => {
    const flags = new Oflags(Oflags.directory);

    assertEquals(flags.directory, true);
  });

  await t.step("excl", () => {
    const flags = new Oflags(Oflags.excl);

    assertEquals(flags.excl, true);
  });

  await t.step("trunc", () => {
    const flags = new Oflags(Oflags.trunc);

    assertEquals(flags.trunc, true);
  });
});
