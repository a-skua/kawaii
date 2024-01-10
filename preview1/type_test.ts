import { assertEquals } from "https://deno.land/std@0.204.0/assert/mod.ts";
import {
  Ciovec,
  Errno,
  Event,
  EventFdReadwrite,
  Eventrwflags,
  Eventtype,
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

  await t.step("fdReadwriteHangup(): true", () => {
    const flags = new Eventrwflags(1);
    assertEquals(flags.fdReadwriteHangup(), true);
  });

  await t.step("fdReadwriteHangup(): false", () => {
    const flags = new Eventrwflags(2);
    assertEquals(flags.fdReadwriteHangup(), false);
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
