import {
  Clockid,
  Errno,
  Exitcode,
  Fd,
  Fdflags,
  Pointer,
  Size,
  Timestamp,
} from "./types.ts";
import { ImportModule, Preview1 } from "./mod.ts";

const decoder = new TextDecoder();

// sched_yield() -> Result<(), errno>
export type SchedYield = () => Errno;
function sched_yield(_: Preview1): SchedYield {
  return () => {
    return Errno.Notsup;
  };
}

// random_get(buf: Pointer<u8>, buf_len: size) -> Result<(), errno>
export type RandomGet = (buf: Pointer, buf_len: Size) => Errno;
function random_get(self: Preview1): RandomGet {
  return (buf, buf_len) => {
    crypto.getRandomValues(new Uint8Array(self.memory.buffer, buf, buf_len));
    return Errno.Success;
  };
}

// args_get(argv: Pointer<Pointer<u8>>, argv_buf: Pointer<u8>) -> Result<(), errno>
export type ArgsGet = (argv: Pointer, argv_buf: Pointer) => Errno;
export function args_get(self: Preview1): ArgsGet {
  return (argv, argv_buf) => {
    for (const arg of self.args) {
      new DataView(self.memory.buffer).setUint32(argv, argv_buf, true);
      argv += 4;

      new Uint8Array(self.memory.buffer).set(arg.buffer, argv_buf);
      argv_buf += arg.buffer.length;
    }
    return Errno.Success;
  };
}

// args_sizes_get() -> Result<(size, size), errno>
export type ArgsSizesGet = (args_num: Pointer, buf_size: Pointer) => Errno;
export function args_sizes_get(
  self: Preview1,
): ArgsSizesGet {
  return (num, size) => {
    const data = new DataView(self.memory.buffer);
    const args = self.args;

    data.setUint32(num, args.length, true);
    data.setUint32(
      size,
      args.reduce((len, arg) => len + arg.buffer.length, 0),
      true,
    );
    return Errno.Success;
  };
}

// clock_time_get(id: clockid, precision: timestamp) -> Result<timestamp, errno>
export type ClockTimeGet = (
  id: Clockid,
  precision: Timestamp,
  timestamp: Pointer,
) => Errno;
function clock_time_get(self: Preview1): ClockTimeGet {
  return (id, _, timestamp) => {
    switch (id) {
      case Clockid.Monotonic: {
        const time_ns = BigInt(Math.floor(performance.now() * 1_000_000));
        new DataView(self.memory.buffer).setBigUint64(timestamp, time_ns, true);
        return Errno.Success;
      }
      default:
        return Errno.Notsup;
    }
  };
}

// poll_oneoff(in: ConstPointer<subscription>, out: Pointer<event>, nsubscriptions: size) -> Result<size, errno>
export type PollOneoff = (
  inz: Pointer,
  out: Pointer,
  nsubscriptions: Size,
  size: Pointer,
) => Errno;
function poll_oneoff(_: Preview1): PollOneoff {
  return () => {
    return Errno.Notsup;
  };
}

// fd_write(fd: fd, iovs: ciovec_array) -> Result<size, errno>
export type FdWrite = (
  fd: Fd,
  iovs: Pointer,
  iovs_size: Size,
  size: Pointer,
) => Errno;
function fd_write(self: Preview1): FdWrite {
  return (fd, iovs, iovs_size, size) => {
    const data = new DataView(self.memory.buffer);
    const memory = new Uint8Array(self.memory.buffer);
    let str = "";
    let strlen = 0;

    for (let i = 0; i < iovs_size; i++) {
      const buf = data.getUint32(iovs, true);
      const len = data.getUint32(iovs + 4, true);

      str += decoder.decode(memory.subarray(buf, buf + len));
      strlen += len;
      iovs += 8;
    }

    switch (fd) {
      case Fd.Stdout:
        // return Errno.Notsup;
        console.log(str);
        break;
      case Fd.Stderr:
        console.error(str);
        break;
      default:
        return Errno.Badf;
    }

    data.setUint32(size, strlen, true);
    return Errno.Success;
  };
}

// fd_close(fd: fd) -> Result<(), errno>
export type FdClose = (fd: Fd) => Errno;
function fd_close(_: Preview1): FdClose {
  return () => {
    return Errno.Notsup;
  };
}

// fd_fdstat_get(fd: fd) -> Result<fdstat, errno>
export type FdFdstatGet = (fd: Fd, fdstat: Pointer) => Errno;
function fd_fdstat_get(_: Preview1): FdFdstatGet {
  return () => {
    return Errno.Notsup;
  };
}

// fd_fdstat_set_flags(fd: fd, flags: fdflags) -> Result<(), errno>
export type FdFdstatSetFlags = (fd: Fd, flags: Fdflags) => Errno;
function fd_fdstat_set_flags(_: Preview1): FdFdstatSetFlags {
  return () => {
    return Errno.Notsup;
  };
}

// fd_prestat_get(fd: fd) -> Result<prestat, errno>
export type FdPrestatGet = (fd: Fd, prestat: Pointer) => Errno;
function fd_prestat_get(_: Preview1): FdPrestatGet {
  return () => {
    return Errno.Badf;
  };
}

// fd_prestat_dir_name(fd: fd, path: Pointer<u8>, path_len: size) -> Result<(), errno>
export type FdPrestatDirName = (fd: Fd, path: Pointer, path_len: Size) => Errno;
function fd_prestat_dir_name(_: Preview1): FdPrestatDirName {
  return () => {
    return Errno.Badf;
  };
}

// environ_get(environ: Pointer<Pointer<u8>>, environ_buf: Pointer<u8>) -> Result<(), errno>
export type EnvironGet = (environ: Pointer, environ_buf: Pointer) => Errno;
function environ_get(_: Preview1): EnvironGet {
  return () => {
    return Errno.Notsup;
  };
}

// environ_sizes_get() -> Result<(size, size), errno>
export type EnvironSizesGet = (num: Pointer, size: Pointer) => Errno;
function environ_sizes_get(self: Preview1): EnvironSizesGet {
  return (num, size) => {
    const data = new DataView(self.memory.buffer);
    data.setUint32(num, 0, true);
    data.setUint32(size, 0, true);
    return Errno.Success;
  };
}

// proc_exit(rval: exitcode)
export type ProcExit = (rval: Exitcode) => void;
function proc_exit(self: Preview1): ProcExit {
  return (rval) => {
    self.exitcode = rval;
    throw `exitcode: ${rval}`;
  };
}

function importModule(state: Preview1): ImportModule {
  return [
    sched_yield,
    args_get,
    args_sizes_get,
    clock_time_get,
    random_get,
    poll_oneoff,
    fd_close,
    fd_fdstat_get,
    fd_fdstat_set_flags,
    fd_prestat_get,
    fd_prestat_dir_name,
    fd_write,
    environ_get,
    environ_sizes_get,
    proc_exit,
  ].reduce((obj, fn) => {
    obj[fn.name] = fn(state);
    return obj;
    // deno-lint-ignore no-explicit-any
  }, {} as any);
}

export default importModule;
