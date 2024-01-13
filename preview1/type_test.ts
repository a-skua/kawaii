import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import {
  BigValue,
  Ciovec,
  Data,
  Errno,
  Event,
  EventFdReadwrite,
  Eventrwflags,
  Eventtype,
  Fdflags,
  Fdstat,
  Filesize,
  Filetype,
  Pointer,
  Preopentype,
  Prestat,
  PrestatDir,
  Rights,
  Size,
  Userdata,
  Value,
} from "./type.ts";

interface DataType {
  alignment: number;
}

const randomPointer = <T extends Data<string>>(
  { alignment }: DataType,
): Pointer<T> => {
  const random = Math.floor(Math.random() * (1024 / alignment));
  return Pointer(random * alignment);
};

const addOffset = <T extends Data<string>>(
  pointer: Pointer<T>,
  offset: number,
): Pointer<T> => Pointer(pointer + offset);

Deno.test("ciovec", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Ciovec> = randomPointer(Ciovec);
    const data = new DataView(memory.buffer);

    data.setUint32(addOffset(pointer, 0), 8, true);
    data.setUint32(addOffset(pointer, 4), 16, true);
    assertEquals(
      Ciovec.cast(memory, pointer),
      new Ciovec({
        buf: Pointer(8),
        len: new Size(Value(16)),
      }),
    );
  });

  await t.step("store()", () => {
    // TODO
  });
});

Deno.test("eventrwflags", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Eventrwflags> = randomPointer(Eventrwflags);

    const data = new DataView(memory.buffer);
    data.setUint16(pointer, 1, true);

    assertEquals(
      Eventrwflags.cast(memory, pointer),
      new Eventrwflags(Value(1)),
    );
  });

  await t.step("fdReadwriteHangup is true", () => {
    const flags = new Eventrwflags(Value(1));
    assertEquals(flags.fdReadwriteHangup, true);
  });

  await t.step("fdReadwriteHangup is false", () => {
    const flags = new Eventrwflags(Value(0));
    assertEquals(flags.fdReadwriteHangup, false);
  });
});

Deno.test("event_fd_readwrite", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<EventFdReadwrite> = randomPointer(EventFdReadwrite);

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, 0), 1024n, true);
    data.setUint16(addOffset(pointer, 8), 1, true);

    assertEquals(
      EventFdReadwrite.cast(memory, pointer),
      new EventFdReadwrite(
        new Filesize(BigValue(1024n)),
        new Eventrwflags(Value(1)),
      ),
    );
  });

  await t.step("store()", () => {
    // TODO
  });
});

Deno.test(Event.name, async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Event> = randomPointer(Event);

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, 0), 100n, true);
    data.setUint16(addOffset(pointer, 8), Errno.notsup, true);
    data.setUint8(addOffset(pointer, 10), Eventtype.fd_write);
    data.setBigUint64(addOffset(pointer, 16), 1024n, true);
    data.setUint16(addOffset(pointer, 24), 1, true);

    assertEquals(
      Event.cast(memory, pointer),
      new Event(
        new Userdata(BigValue(100n)),
        new Errno(Errno.notsup),
        new Eventtype(Eventtype.fd_write),
        new EventFdReadwrite(
          new Filesize(BigValue(1024n)),
          new Eventrwflags(Value(1)),
        ),
      ),
    );
  });

  await t.step("store()", () => {
    // TODO
  });
});

Deno.test("fdflags", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Fdflags> = randomPointer(Fdflags);
    const data = new DataView(memory.buffer);

    data.setUint16(pointer, Fdflags.dsync | Fdflags.rsync, true);
    assertEquals(Fdflags.cast(memory, pointer), new Fdflags(Value(10)));
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Fdflags> = randomPointer(Fdflags);

    const flags = new Fdflags(Fdflags.sync);
    flags.store(memory, pointer);
    assertEquals(
      new Uint8Array(memory.buffer, pointer, 16),
      new Uint8Array([
        ...[16, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
      ]),
    );
  });

  await t.step("append", () => {
    const flags = new Fdflags(Value(Fdflags.append));
    assertEquals(flags.append, true);
  });

  await t.step("dsync", () => {
    const flags = new Fdflags(Value(Fdflags.dsync));
    assertEquals(flags.dsync, true);
  });

  await t.step("nonblock", () => {
    const flags = new Fdflags(Value(Fdflags.nonblock));
    assertEquals(flags.nonblock, true);
  });

  await t.step("rsync", () => {
    const flags = new Fdflags(Value(Fdflags.rsync));
    assertEquals(flags.rsync, true);
  });

  await t.step("sync", () => {
    const flags = new Fdflags(Value(Fdflags.sync));
    assertEquals(flags.sync, true);
  });
});

Deno.test("rights", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Rights> = randomPointer(Rights);
    const data = new DataView(memory.buffer);

    data.setBigUint64(pointer, 1_000_000n, true);
    assertEquals(
      Rights.cast(memory, pointer),
      new Rights(BigValue(1_000_000n)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Rights> = randomPointer(Rights);

    const rights = new Rights(Rights.fd_write);
    rights.store(memory, pointer);
    assertEquals(
      new Uint8Array(memory.buffer, pointer, 64),
      new Uint8Array([
        ...[64, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
      ]),
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
    const pointer: Pointer<Filetype> = randomPointer(Filetype);
    const data = new DataView(memory.buffer);
    data.setUint8(pointer, Filetype.character_device);

    assertEquals(
      Filetype.cast(memory, pointer),
      new Filetype(Filetype.character_device),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Filetype> = randomPointer(Filetype);

    const filetype = new Filetype(Value(100));
    filetype.store(memory, pointer);
    assertEquals(
      new Uint8Array(memory.buffer, pointer, 8),
      new Uint8Array([100, 0, 0, 0, 0, 0, 0, 0]),
    );
  });
});

Deno.test("fdstat", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Fdstat> = randomPointer(Fdstat);
    const offset = 8;
    const data = new DataView(memory.buffer);
    data.setUint8(addOffset(pointer, offset), Filetype.character_device);
    data.setUint16(addOffset(pointer, offset + 2), Fdflags.nonblock, true);
    data.setBigUint64(addOffset(pointer, offset + 8), Rights.fd_write, true);
    data.setBigUint64(addOffset(pointer, offset + 16), Rights.fd_write, true);

    assertEquals(
      Fdstat.cast(memory, pointer, offset),
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
    const pointer: Pointer<Fdstat> = randomPointer(Fdstat);
    const offset = 8;

    const fdstat = new Fdstat({
      fs_filetype: new Filetype(Filetype.character_device),
      fs_flags: new Fdflags(Fdflags.nonblock),
      fs_rights_base: new Rights(Rights.fd_write),
      fs_rights_inheriting: new Rights(Rights.fd_write),
    });
    fdstat.store(memory, pointer, offset);
    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), 24),
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
    const pointer: Pointer<Preopentype> = randomPointer(Preopentype);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint8(addOffset(pointer, offset), 1);

    assertEquals(
      Preopentype.cast(memory, pointer, offset),
      new Preopentype(Value(1)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Preopentype> = randomPointer(Preopentype);
    const offset = 8;

    const opentype = new Preopentype(Value(1));
    opentype.store(memory, pointer, offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), 8),
      new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0]),
    );
  });
});

Deno.test("prestat_dir", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<PrestatDir> = randomPointer(PrestatDir);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint32(addOffset(pointer, offset), 16, true);

    assertEquals(
      PrestatDir.cast(memory, pointer, offset),
      new PrestatDir({ pr_name_len: new Size(Value(16)) }),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer<PrestatDir>(PrestatDir);
    const offset = 8;

    const prestat = new PrestatDir({
      pr_name_len: new Size(Value(16)),
    });
    prestat.store(memory, pointer, offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), 4),
      new Uint8Array([
        ...[16, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("prestat", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Prestat> = randomPointer(Prestat);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setUint8(addOffset(pointer, offset), 1);
    data.setUint32(addOffset(pointer, offset + 4), 16, true);

    assertEquals(
      Prestat.cast(memory, pointer, offset),
      new Prestat({
        type: new Preopentype(Value(1)),
        content: new PrestatDir({ pr_name_len: new Size(Value(16)) }),
      }),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Prestat> = randomPointer(Prestat);
    const offset = 8;

    const stat = new Prestat({
      type: new Preopentype(Value(1)),
      content: new PrestatDir({ pr_name_len: new Size(Value(16)) }),
    });
    stat.store(memory, pointer, offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), 8),
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
    const pointer: Pointer<Userdata> = randomPointer(Userdata);
    const offset = 8;

    const data = new DataView(memory.buffer);
    data.setBigUint64(addOffset(pointer, offset), 1n, true);

    assertEquals(
      Userdata.cast(memory, pointer, offset),
      new Userdata(BigValue(1n)),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer: Pointer<Userdata> = randomPointer(Userdata);
    const offset = 8;

    const data = new Userdata(BigValue(1n));
    data.store(memory, pointer, offset);

    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), 8),
      new Uint8Array([
        ...[1, 0, 0, 0, 0, 0, 0, 0],
      ]),
    );
  });
});

Deno.test("u8", async (t) => {
  // TODO
});

Deno.test("size", async (t) => {
  // TODO
});

Deno.test("timestamp", async (t) => {
  // TODO
});
