import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import {
  Ciovec,
  Errno,
  Event,
  EventFdReadwrite,
  Eventrwflags,
  Eventtype,
  Fdflags,
  Fdstat,
  Filetype,
  Pointer,
  Rights,
} from "./type.ts";

interface DataType {
  alignment: number;
}

const randomPointer = ({ alignment }: DataType): number => {
  const random = Math.floor(Math.random() * (1024 / alignment));
  return random * alignment;
};

const addOffset = <T>(pointer: Pointer<T>, offset: number): Pointer<T> =>
  pointer + (offset * 8);

Deno.test(Ciovec.name, () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const data = new DataView(memory.buffer);
  data.setUint32(0, 8, true);
  data.setUint32(4, 16, true);
  assertEquals(Ciovec.cast(memory, 0), new Ciovec(8, 16));
});

Deno.test(Eventrwflags.name, async (t) => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const data = new DataView(memory.buffer);

  await t.step(Eventrwflags.cast.name, () => {
    data.setUint16(0, 1, true);
    assertEquals(Eventrwflags.cast(memory, 0), new Eventrwflags(1));
  });

  await t.step("fdReadwriteHangup is true", () => {
    const flags = new Eventrwflags(1);
    assertEquals(flags.fdReadwriteHangup, true);
  });

  await t.step("fdReadwriteHangup is false", () => {
    const flags = new Eventrwflags(0);
    assertEquals(flags.fdReadwriteHangup, false);
  });
});

Deno.test(EventFdReadwrite.name, () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const data = new DataView(memory.buffer);
  data.setBigUint64(0, 1024n, true);
  data.setUint16(8, 1, true);
  assertEquals(
    EventFdReadwrite.cast(memory, 0),
    new EventFdReadwrite(1024n, new Eventrwflags(1)),
  );
});

Deno.test(Event.name, () => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  const data = new DataView(memory.buffer);
  data.setBigUint64(0, 100n, true);
  data.setUint16(8, Errno.Notsup, true);
  data.setUint8(10, Eventtype.FdWrite);
  data.setBigUint64(16, 1024n, true);
  data.setUint16(24, 1, true);
  assertEquals(
    Event.cast(memory, 0),
    new Event(
      100n,
      Errno.Notsup,
      Eventtype.FdWrite,
      new EventFdReadwrite(1024n, new Eventrwflags(1)),
    ),
  );
});

Deno.test("fdflags", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Fdflags);
    const data = new DataView(memory.buffer);

    data.setUint16(pointer, Fdflags.dsync | Fdflags.rsync, true);
    assertEquals(Fdflags.cast(memory, pointer), new Fdflags(10));
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Fdflags);

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
    const flags = new Fdflags(1 << 0);
    assertEquals(flags.append, true);
  });

  await t.step("dsync", () => {
    const flags = new Fdflags(1 << 1);
    assertEquals(flags.dsync, true);
  });

  await t.step("nonblock", () => {
    const flags = new Fdflags(1 << 2);
    assertEquals(flags.nonblock, true);
  });

  await t.step("rsync", () => {
    const flags = new Fdflags(1 << 3);
    assertEquals(flags.rsync, true);
  });

  await t.step("sync", () => {
    const flags = new Fdflags(1 << 4);
    assertEquals(flags.sync, true);
  });
});

Deno.test("rights", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Rights);
    const data = new DataView(memory.buffer);

    data.setBigUint64(pointer, 1_000_000n, true);
    assertEquals(Rights.cast(memory, pointer), new Rights(1_000_000n));
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Rights);

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
    const flags = new Rights(1n << 0n);
    assertEquals(flags.fd_datasync, true);
  });

  await t.step("fd_read", () => {
    const flags = new Rights(1n << 1n);
    assertEquals(flags.fd_read, true);
  });

  await t.step("fd_seek", () => {
    const flags = new Rights(1n << 2n);
    assertEquals(flags.fd_seek, true);
  });

  await t.step("fd_fdstat_set_flags", () => {
    const flags = new Rights(1n << 3n);
    assertEquals(flags.fd_fdstat_set_flags, true);
  });

  await t.step("fd_sync", () => {
    const flags = new Rights(1n << 4n);
    assertEquals(flags.fd_sync, true);
  });

  await t.step("fd_tell", () => {
    const flags = new Rights(1n << 5n);
    assertEquals(flags.fd_tell, true);
  });

  await t.step("fd_write", () => {
    const flags = new Rights(1n << 6n);
    assertEquals(flags.fd_write, true);
  });

  await t.step("fd_advise", () => {
    const flags = new Rights(1n << 7n);
    assertEquals(flags.fd_advise, true);
  });

  await t.step("fd_allocate", () => {
    const flags = new Rights(1n << 8n);
    assertEquals(flags.fd_allocate, true);
  });

  await t.step("path_create_directory", () => {
    const flags = new Rights(1n << 9n);
    assertEquals(flags.path_create_directory, true);
  });

  await t.step("path_create_file", () => {
    const flags = new Rights(1n << 10n);
    assertEquals(flags.path_create_file, true);
  });

  await t.step("path_link_source", () => {
    const flags = new Rights(1n << 11n);
    assertEquals(flags.path_link_source, true);
  });

  await t.step("path_link_target", () => {
    const flags = new Rights(1n << 12n);
    assertEquals(flags.path_link_target, true);
  });

  await t.step("path_open", () => {
    const flags = new Rights(1n << 13n);
    assertEquals(flags.path_open, true);
  });

  await t.step("fd_readdir", () => {
    const flags = new Rights(1n << 14n);
    assertEquals(flags.fd_readdir, true);
  });

  await t.step("path_readlink", () => {
    const flags = new Rights(1n << 15n);
    assertEquals(flags.path_readlink, true);
  });

  await t.step("path_rename_source", () => {
    const flags = new Rights(1n << 16n);
    assertEquals(flags.path_rename_source, true);
  });

  await t.step("path_rename_target", () => {
    const flags = new Rights(1n << 17n);
    assertEquals(flags.path_rename_target, true);
  });

  await t.step("path_filestat_get", () => {
    const flags = new Rights(1n << 18n);
    assertEquals(flags.path_filestat_get, true);
  });

  await t.step("path_filestat_set_size", () => {
    const flags = new Rights(1n << 19n);
    assertEquals(flags.path_filestat_set_size, true);
  });

  await t.step("path_filestat_set_times", () => {
    const flags = new Rights(1n << 20n);
    assertEquals(flags.path_filestat_set_times, true);
  });

  await t.step("fd_filestat_get", () => {
    const flags = new Rights(1n << 21n);
    assertEquals(flags.fd_filestat_get, true);
  });

  await t.step("fd_filestat_set_size", () => {
    const flags = new Rights(1n << 22n);
    assertEquals(flags.fd_filestat_set_size, true);
  });

  await t.step("fd_filestat_set_times", () => {
    const flags = new Rights(1n << 23n);
    assertEquals(flags.fd_filestat_set_times, true);
  });

  await t.step("path_symlink", () => {
    const flags = new Rights(1n << 24n);
    assertEquals(flags.path_symlink, true);
  });

  await t.step("path_remove_directory", () => {
    const flags = new Rights(1n << 25n);
    assertEquals(flags.path_remove_directory, true);
  });

  await t.step("path_unlink_file", () => {
    const flags = new Rights(1n << 26n);
    assertEquals(flags.path_unlink_file, true);
  });

  await t.step("poll_fd_readwrite", () => {
    const flags = new Rights(1n << 27n);
    assertEquals(flags.poll_fd_readwrite, true);
  });

  await t.step("sock_shutdown", () => {
    const flags = new Rights(1n << 28n);
    assertEquals(flags.sock_shutdown, true);
  });

  await t.step("sock_accept", () => {
    const flags = new Rights(1n << 29n);
    assertEquals(flags.sock_accept, true);
  });
});

Deno.test("filetype", async (t) => {
  await t.step("cast()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Filetype);
    const data = new DataView(memory.buffer);
    data.setUint8(pointer, Filetype.character_device);

    assertEquals(
      Filetype.cast(memory, pointer),
      new Filetype(Filetype.character_device),
    );
  });

  await t.step("store()", () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const pointer = randomPointer(Filetype);

    const filetype = new Filetype(100);
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
    const pointer = randomPointer(Fdstat);
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
    const pointer = randomPointer(Fdstat);
    const offset = 8;

    const fdstat = new Fdstat({
      fs_filetype: new Filetype(Filetype.character_device),
      fs_flags: new Fdflags(Fdflags.nonblock),
      fs_rights_base: new Rights(Rights.fd_write),
      fs_rights_inheriting: new Rights(Rights.fd_write),
    });
    fdstat.store(memory, pointer, offset);
    assertEquals(
      new Uint8Array(memory.buffer, addOffset(pointer, offset), 24 * 8),
      new Uint8Array([
        // fs_filetype
        ...[2, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        // fd_flags,
        ...[4, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        // fs_rights_base
        ...[64, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        ...[0, 0, 0, 0, 0, 0, 0, 0],
        // fs_rights_inheriting
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
});
