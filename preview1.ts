import {
  Clockid,
  Errno,
  Exitcode,
  Fd,
  Fdflags,
  Pointer,
  Size,
  Timestamp,
} from "./preview1/typedef.ts";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class Arg {
  buffer: Uint8Array;
  constructor(
    value: string,
  ) {
    this.buffer = encoder.encode(`${value}\0`);
  }
}

// sched_yield() -> Result<(), errno>
type SchedYield = () => Errno;
function sched_yield(self: Preview1): SchedYield {
  return () => {
    self.__debug.calls.push("sched_yield");
    return Errno.Notsup;
  };
}

// random_get(buf: Pointer<u8>, buf_len: size) -> Result<(), errno>
type RandomGet = (buf: Pointer, buf_len: Size) => Errno;
function random_get(self: Preview1): RandomGet {
  return (buf, buf_len) => {
    self.__debug.calls.push("random_get");

    crypto.getRandomValues(new Uint8Array(self.memory.buffer, buf, buf_len));
    return Errno.Success;
  };
}

// args_get(argv: Pointer<Pointer<u8>>, argv_buf: Pointer<u8>) -> Result<(), errno>
type ArgsGet = (argv: Pointer, argv_buf: Pointer) => Errno;
function args_get(self: Preview1): ArgsGet {
  return (argv, argv_buf) => {
    self.__debug.calls.push("args_get");

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
type ArgsSizesGet = (args_num: Pointer, buf_size: Pointer) => Errno;
function args_sizes_get(
  self: Preview1,
): ArgsSizesGet {
  return (num, size) => {
    self.__debug.calls.push("args_sizes_get");

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
type ClockTimeGet = (
  id: Clockid,
  precision: Timestamp,
  timestamp: Pointer,
) => Errno;
function clock_time_get(self: Preview1): ClockTimeGet {
  return (id, _, timestamp) => {
    self.__debug.calls.push("clock_time_get");

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
type PollOneoff = (
  inz: Pointer,
  out: Pointer,
  nsubscriptions: Size,
  size: Pointer,
) => Errno;
function poll_oneoff(self: Preview1): PollOneoff {
  return () => {
    self.__debug.calls.push("poll_oneoff");

    return Errno.Notsup;
  };
}

// fd_write(fd: fd, iovs: ciovec_array) -> Result<size, errno>
type FdWrite = (fd: Fd, iovs: Pointer, iovs_size: Size, size: Pointer) => Errno;
function fd_write(self: Preview1): FdWrite {
  return (fd, iovs, iovs_size, size) => {
    self.__debug.calls.push("fd_write");

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
        self.__debug.stdout += str;
        // return Errno.Notsup;
        console.log(str);
        break;
      case Fd.Stderr:
        self.__debug.stderr += str;
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
type FdClose = (fd: Fd) => Errno;
function fd_close(self: Preview1): FdClose {
  return () => {
    self.__debug.calls.push("fd_close");

    return Errno.Notsup;
  };
}

// fd_fdstat_get(fd: fd) -> Result<fdstat, errno>
type FdFdstatGet = (fd: Fd, fdstat: Pointer) => Errno;
function fd_fdstat_get(self: Preview1): FdFdstatGet {
  return () => {
    self.__debug.calls.push("fd_fdstat_get");

    return Errno.Notsup;
  };
}

// fd_fdstat_set_flags(fd: fd, flags: fdflags) -> Result<(), errno>
type FdFdstatSetFlags = (fd: Fd, flags: Fdflags) => Errno;
function fd_fdstat_set_flags(self: Preview1): FdFdstatSetFlags {
  return () => {
    self.__debug.calls.push("fd_fdstat_set_flags");

    return Errno.Notsup;
  };
}

// fd_prestat_get(fd: fd) -> Result<prestat, errno>
type FdPrestatGet = (fd: Fd, prestat: Pointer) => Errno;
function fd_prestat_get(self: Preview1): FdPrestatGet {
  return () => {
    self.__debug.calls.push("fd_prestat_get");

    return Errno.Badf;
  };
}

// fd_prestat_dir_name(fd: fd, path: Pointer<u8>, path_len: size) -> Result<(), errno>
type FdPrestatDirName = (fd: Fd, path: Pointer, path_len: Size) => Errno;
function fd_prestat_dir_name(self: Preview1): FdPrestatDirName {
  return () => {
    self.__debug.calls.push("fd_prestat_dir_name");

    return Errno.Badf;
  };
}

// environ_get(environ: Pointer<Pointer<u8>>, environ_buf: Pointer<u8>) -> Result<(), errno>
type EnvironGet = (environ: Pointer, environ_buf: Pointer) => Errno;
function environ_get(self: Preview1): EnvironGet {
  return () => {
    self.__debug.calls.push("environ_get");

    return Errno.Notsup;
  };
}

// environ_sizes_get() -> Result<(size, size), errno>
type EnvironSizesGet = (num: Pointer, size: Pointer) => Errno;
function environ_sizes_get(self: Preview1): EnvironSizesGet {
  return (num, size) => {
    self.__debug.calls.push("environ_sizes_get");

    const data = new DataView(self.memory.buffer);
    data.setUint32(num, 0, true);
    data.setUint32(size, 0, true);
    return Errno.Success;
  };
}

// proc_exit(rval: exitcode)
type ProcExit = (rval: Exitcode) => void;
function proc_exit(self: Preview1): ProcExit {
  return (rval) => {
    self.__debug.calls.push("proc_exit");

    self.exitcode = rval;
    throw `exitcode: ${rval}`;
  };
}

type ImportModule = {
  sched_yield: SchedYield;

  args_get: ArgsGet;
  args_sizes_get: ArgsSizesGet;

  clock_time_get: ClockTimeGet;
  random_get: RandomGet;

  poll_oneoff: PollOneoff;
  fd_close: FdClose;

  fd_fdstat_get: FdFdstatGet;
  fd_fdstat_set_flags: FdFdstatSetFlags;
  fd_prestat_get: FdPrestatGet;
  fd_prestat_dir_name: FdPrestatDirName;
  fd_write: FdWrite;
  environ_get: EnvironGet;
  environ_sizes_get: EnvironSizesGet;
  proc_exit: ProcExit;
};

interface Preview1 {
  args: Arg[];
  memory: WebAssembly.Memory;
  exitcode: Exitcode;
  __debug: {
    calls: string[];
    stdout: string;
    stderr: string;
  };
}
export default class {
  // Lazy init: memory
  memory: WebAssembly.Memory | undefined;
  exitcode: Exitcode = 0;
  readonly __debug = {
    calls: [],
    stdout: "",
    stderr: "",
  };

  constructor(
    readonly args: Arg[],
  ) {
  }

  private isPreview1(): this is Preview1 {
    return this.memory !== undefined;
  }

  __init(memory: WebAssembly.Memory) {
    this.memory = memory;
  }

  importModule(): ImportModule {
    const self = this as Preview1;
    return {
      sched_yield: sched_yield(self),

      args_get: args_get(self),
      args_sizes_get: args_sizes_get(self),

      clock_time_get: clock_time_get(self),
      random_get: random_get(self),

      poll_oneoff: poll_oneoff(self),
      fd_close: fd_close(self),

      fd_fdstat_get: fd_fdstat_get(self),
      fd_fdstat_set_flags: fd_fdstat_set_flags(self),
      fd_prestat_get: fd_prestat_get(self),
      fd_prestat_dir_name: fd_prestat_dir_name(self),
      fd_write: fd_write(self),
      environ_get: environ_get(self),
      environ_sizes_get: environ_sizes_get(self),
      proc_exit: proc_exit(self),
    };
  }
}
