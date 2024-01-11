import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import {
  Ciovec,
  Errno,
  Event,
  EventFdReadwrite,
  Eventrwflags,
  Eventtype,
  Fdflags,
  Rights,
} from "./type.ts";

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

Deno.test(Fdflags.name, async (t) => {
  await t.step(Fdflags.cast.name, () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const data = new DataView(memory.buffer);
    data.setUint16(0, Fdflags.dsync | Fdflags.rsync, true);
    assertEquals(Fdflags.cast(memory, 0), new Fdflags(10));
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

Deno.test(Rights.name, async (t) => {
  await t.step(Rights.cast.name, () => {
    const memory = new WebAssembly.Memory({ initial: 1 });
    const data = new DataView(memory.buffer);
    data.setBigUint64(0, 1_000_000n, true);
    assertEquals(Rights.cast(memory, 0), new Rights(1_000_000n));
  });

  await t.step("fdRead", () => {
    const flags = new Rights(1n << 1n);
    assertEquals(flags.fdRead, true);
  });

  await t.step("fdSeek", () => {
    const flags = new Rights(1n << 2n);
    assertEquals(flags.fdSeek, true);
  });

  await t.step("fdFdstatSetFlags", () => {
    const flags = new Rights(1n << 3n);
    assertEquals(flags.fdFdstatSetFlags, true);
  });

  await t.step("fdSync", () => {
    const flags = new Rights(1n << 4n);
    assertEquals(flags.fdSync, true);
  });

  await t.step("fdTell", () => {
    const flags = new Rights(1n << 5n);
    assertEquals(flags.fdTell, true);
  });

  await t.step("fdWrite", () => {
    const flags = new Rights(1n << 6n);
    assertEquals(flags.fdWrite, true);
  });

  await t.step("fdAdvise", () => {
    const flags = new Rights(1n << 7n);
    assertEquals(flags.fdAdvise, true);
  });

  await t.step("fdAllocate", () => {
    const flags = new Rights(1n << 8n);
    assertEquals(flags.fdAllocate, true);
  });

  await t.step("pathCreateDirectory", () => {
    const flags = new Rights(1n << 9n);
    assertEquals(flags.pathCreateDirectory, true);
  });

  await t.step("pathCreateFile", () => {
    const flags = new Rights(1n << 10n);
    assertEquals(flags.pathCreateFile, true);
  });

  await t.step("pathLinkSource", () => {
    const flags = new Rights(1n << 11n);
    assertEquals(flags.pathLinkSource, true);
  });

  await t.step("pathLinkTarget", () => {
    const flags = new Rights(1n << 12n);
    assertEquals(flags.pathLinkTarget, true);
  });

  await t.step("pathOpen", () => {
    const flags = new Rights(1n << 13n);
    assertEquals(flags.pathOpen, true);
  });

  await t.step("fdReaddir", () => {
    const flags = new Rights(1n << 14n);
    assertEquals(flags.fdReaddir, true);
  });

  await t.step("pathReadlink", () => {
    const flags = new Rights(1n << 15n);
    assertEquals(flags.pathReadlink, true);
  });

  await t.step("pathRenameSource", () => {
    const flags = new Rights(1n << 16n);
    assertEquals(flags.pathRenameSource, true);
  });

  await t.step("pathRenameTarget", () => {
    const flags = new Rights(1n << 17n);
    assertEquals(flags.pathRenameTarget, true);
  });

  await t.step("pathFilestatGet", () => {
    const flags = new Rights(1n << 18n);
    assertEquals(flags.pathFilestatGet, true);
  });

  await t.step("pathFilestatSetSize", () => {
    const flags = new Rights(1n << 19n);
    assertEquals(flags.pathFilestatSetSize, true);
  });

  await t.step("pathFilestatSetTimes", () => {
    const flags = new Rights(1n << 20n);
    assertEquals(flags.pathFilestatSetTimes, true);
  });

  await t.step("fdFilestatGet", () => {
    const flags = new Rights(1n << 21n);
    assertEquals(flags.fdFilestatGet, true);
  });

  await t.step("fdFilestatSetSize", () => {
    const flags = new Rights(1n << 22n);
    assertEquals(flags.fdFilestatSetSize, true);
  });

  await t.step("fdFilestatSetTimes", () => {
    const flags = new Rights(1n << 23n);
    assertEquals(flags.fdFilestatSetTimes, true);
  });

  await t.step("pathSymlink", () => {
    const flags = new Rights(1n << 24n);
    assertEquals(flags.pathSymlink, true);
  });

  await t.step("pathRemoveDirectory", () => {
    const flags = new Rights(1n << 25n);
    assertEquals(flags.pathRemoveDirectory, true);
  });

  await t.step("pathUnlinkFile", () => {
    const flags = new Rights(1n << 26n);
    assertEquals(flags.pathUnlinkFile, true);
  });

  await t.step("pollFdReadwrite", () => {
    const flags = new Rights(1n << 27n);
    assertEquals(flags.pollFdReadwrite, true);
  });

  await t.step("sockShutdown", () => {
    const flags = new Rights(1n << 28n);
    assertEquals(flags.sockShutdown, true);
  });

  await t.step("sockAccept", () => {
    const flags = new Rights(1n << 29n);
    assertEquals(flags.sockAccept, true);
  });
});
