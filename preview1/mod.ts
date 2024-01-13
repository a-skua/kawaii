import {
  BigValue,
  Ciovec,
  CiovecArray,
  Clockid,
  Errno,
  Event,
  Exitcode,
  Fd,
  Fdflags,
  Fdstat,
  Filesize,
  Filestat,
  Filetype,
  IovecArray,
  Pointer,
  Prestat,
  Rights,
  Size,
  Subscription,
  Timestamp,
  U8,
  Value,
} from "./type.ts";

let memory: WebAssembly.Memory;
let args: Arg[];
let envs: Env[];
let stdout: (str: string) => void;
let stderr: (str: string) => void;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class Env {
  constructor(readonly name: string, readonly value: string) {}

  toString(): string {
    return `${this.name}=${this.value}`;
  }
}

export class Arg {
  constructor(readonly value: string) {}

  toString(): string {
    return this.value;
  }
}

export class Exit {
  constructor(readonly code: Exitcode) {}

  toString(): string {
    return this.code.toString();
  }
}

// sched_yield() -> Result<(), errno>
//
// Temporarily yield execution of the calling thread. Note: This is similar to sched_yield in POSIX.
export function sched_yield(): Errno {
  return Errno.Nosys;
}

// proc_exit(rval: exitcode)
//
// Terminate the process normally. An exit code of 0 indicates successful termination of the program. The meanings of other values is dependent on the environment.
export function proc_exit(rval: Exitcode) {
  throw new Exit(rval);
}

// args_get(argv: Pointer<Pointer<u8>>, argv_buf: Pointer<u8>) -> Result<(), errno>
//
// Read command-line argument data. The size of the array should match that returned by args_sizes_get. Each argument is expected to be \0 terminated.
export function args_get(
  argv: Pointer<Pointer<U8>>,
  argv_buf: Pointer<U8>,
): Errno {
  const data = new DataView(memory.buffer);
  const array = new Uint8Array(memory.buffer);

  for (const arg of args) {
    data.setUint32(argv, argv_buf, true);
    argv = Pointer(argv + 4);
    const { written } = encoder.encodeInto(
      `${arg}\0`,
      array.subarray(argv_buf),
    );
    argv_buf = Pointer(argv_buf + written);
  }
  return Errno.Success;
}

// args_sizes_get() -> Result<(size, size), errno>
//
// Return command-line argument data sizes.
export function args_sizes_get(
  args_num: Pointer<Size>,
  buf_size: Pointer<Size>,
): Errno {
  const size = args.map((arg) => encoder.encode(`${arg}\0`).length).reduce((
    sum,
    len,
  ) => sum + len, 0);

  const data = new DataView(memory.buffer);
  data.setUint32(args_num, args.length, true);
  data.setUint32(buf_size, size, true);
  return Errno.Success;
}

// clock_time_get(id: clockid, precision: timestamp) -> Result<timestamp, errno>
//
// Return the time value of a clock. Note: This is similar to clock_gettime in
// POSIX.
export function clock_time_get(
  id: Clockid,
  _precision: BigValue<Timestamp>,
  result: Pointer<Timestamp>,
): Errno {
  const data = new DataView(memory.buffer);
  switch (id) {
    case Clockid.Realtime: {
      const ns = BigInt(new Date().getTime()) * 1_000_000n;
      data.setBigUint64(result, ns, true);
      return Errno.Success;
    }
    case Clockid.Monotonic: {
      const ns = BigInt(performance.now()) * 1_000_000n;
      data.setBigUint64(result, ns, true);
      return Errno.Success;
    }
    default:
      return Errno.Notsup;
  }
}

// environ_get(environ: Pointer<Pointer<u8>>, environ_buf: Pointer<u8>) -> Result<(), errno>
//
// Read environment variable data. The sizes of the buffers should match that
// returned by `environ_sizes_get`. Key/value pairs are expected to be joined
// with `=`s, and terminated with `\0`s.
export function environ_get(
  environ: Pointer<Pointer<U8>>,
  env_buf: Pointer<U8>,
): Errno {
  const data = new DataView(memory.buffer);
  const array = new Uint8Array(memory.buffer);

  for (const env of envs) {
    data.setUint32(environ, env_buf, true);
    environ = Pointer(environ + 4);

    const { written } = encoder.encodeInto(`${env}\0`, array.subarray(env_buf));
    env_buf = Pointer(env_buf + written);
  }
  return Errno.Success;
}

// environ_sizes_get() -> Result<(size, size), errno>
//
// Return environment variable data sizes.
export function environ_sizes_get(
  env_num: Pointer<Size>,
  buf_size: Pointer<Size>,
): Errno {
  const size = envs.map((env) => encoder.encode(`${env}\0`).length).reduce((
    sum,
    len,
  ) => sum + len, 0);

  const data = new DataView(memory.buffer);
  data.setUint32(env_num, envs.length, true);
  data.setUint32(buf_size, size, true);
  return Errno.Success;
}

// fd_write(fd: fd, iovs: ciovec_array) -> Result<size, errno>
//
// Write to a file descriptor. Note: This is similar to writev in POSIX.
//
// Like POSIX, any calls of write (and other functions to read or write) for a
// regular file by other threads in the WASI process should not be interleaved
// while write is executed.
export function fd_write(
  fd: Fd,
  iovs: Pointer<CiovecArray>,
  iovs_size: Value<Size>,
  result: Pointer<Size>,
): Errno {
  const array = new Uint8Array(memory.buffer);
  let str = "";
  let len = 0;

  for (let i = 0; i < iovs_size; i++) {
    const iov = Ciovec.cast(memory, Pointer(iovs));
    iovs = Pointer(iovs + iov.size);

    str += decoder.decode(array.subarray(iov.buf, iov.buf + iov.len.value));
    len += iov.len.value;
  }

  switch (fd) {
    case Fd.Stdout:
      stdout(str);
      break;
    case Fd.Stderr:
      stderr(str);
      break;
    default:
      return Errno.Badf;
  }

  const data = new DataView(memory.buffer);
  data.setUint32(result, len, true);
  return Errno.Success;
}

// random_get(buf: Pointer<u8>, buf_len: size) -> Result<(), errno>
//
// Write high-quality random data into a buffer. This function blocks when the
// implementation is unable to immediately provide sufficient high-quality
// random data. This function may execute slowly, so when large mounts of random
// data are required, it's advisable to use this function to seed a
// pseudo-random number generator, rather than to provide the random data
// directly.
export function random_get(buf: Pointer<U8>, len: Value<Size>): Errno {
  crypto.getRandomValues(new Uint8Array(memory.buffer, buf, len));
  return Errno.Success;
}

// poll_oneoff(in: ConstPointer<subscription>, out: Pointer<event>, nsubscriptions: size) -> Result<size, errno>
//
// Concurrently poll for the occurrence of a set of events.
// If nsubscriptions is 0, returns errno::inval.
export function poll_oneoff(
  _in: Pointer<Subscription>,
  _out: Pointer<Event>,
  nsubscriptions: Value<Size>,
  _result: Pointer<Size>,
): Errno {
  if (nsubscriptions === 0) {
    return Errno.Inval;
  }
  return Errno.Notsup;
}

// fd_close(fd: fd) -> Result<(), errno>
//
// Close a file descriptor. Note: This is similar to close in POSIX.
export function fd_close(_fd: Fd): Errno {
  return Errno.Nosys;
}

// fd_filestat_get(fd: fd) -> Result<filestat, errno>
//
// Return the attributes of an open file.
export function fd_filestat_get(_fd: Fd, _result: Pointer<Filestat>): Errno {
  return Errno.Nosys;
}

// fd_pread(fd: fd, iovs: iovec_array, offset: filesize) -> Result<size, errno>
//
// Read from a file descriptor, without using and updating the file descriptor's
// offset. Note: This is similar to preadv in Linux (and other Unix-es).
export function fd_pread(
  _fd: Fd,
  _iovs: Pointer<IovecArray>,
  _offset: Filesize,
  _result: Pointer<Size>,
): Errno {
  return Errno.Nosys;
}

// fd_pwrite(fd: fd, iovs: ciovec_array, offset: filesize) -> Result<size, errno>
//
// Write to a file descriptor, without using and updating the file descriptor's
// offset. Note: This is similar to pwritev in Linux (and other Unix-es).
// Like Linux (and other Unix-es), any calls of pwrite (and other functions to
// read or write) for a regular file by other threads in the WASI process should
// not be interleaved while pwrite is executed.

export function fd_pwrite(
  _fd: Fd,
  _iovs: Pointer<CiovecArray>,
  _offset: Filesize,
  _result: Pointer<Size>,
): Errno {
  return Errno.Nosys;
}

// fd_read(fd: fd, iovs: iovec_array) -> Result<size, errno>
//
// Read from a file descriptor. Note: This is similar to readv in POSIX.
export function fd_read(
  _fd: Fd,
  _iovs: Pointer<IovecArray>,
  _result: Pointer<Size>,
): Errno {
  return Errno.Nosys;
}

const fdstats = [
  // stdin
  new Fdstat({
    fs_filetype: new Filetype(Filetype.character_device),
    fs_flags: new Fdflags(Fdflags.nonblock),
    fs_rights_base: Rights.no(),
    fs_rights_inheriting: Rights.no(),
  }),
  // stdout
  new Fdstat({
    fs_filetype: new Filetype(Filetype.character_device),
    fs_flags: new Fdflags(Fdflags.nonblock),
    fs_rights_base: new Rights(Rights.fd_write),
    fs_rights_inheriting: new Rights(Rights.fd_write),
  }),
  // stderr
  new Fdstat({
    fs_filetype: new Filetype(Filetype.character_device),
    fs_flags: new Fdflags(Fdflags.nonblock),
    fs_rights_base: new Rights(Rights.fd_write),
    fs_rights_inheriting: new Rights(Rights.fd_write),
  }),
];

// fd_fdstat_get(fd: fd) -> Result<fdstat, errno>
//
// Get the attributes of a file descriptor. Note: This returns similar flags
// to fcntl(fd, F_GETFL) in POSIX, as well as additional fields.
export function fd_fdstat_get(fd: Fd, result: Pointer<Fdstat>): Errno {
  if (!fdstats[fd]) {
    return Errno.Badf;
  }

  fdstats[fd].store(memory, result);
  return Errno.Success;
}

// fd_fdstat_set_flags(fd: fd, flags: fdflags) -> Result<(), errno>
//
// Adjust the flags associated with a file descriptor. Note: This is similar
// to fcntl(fd, F_SETFL, flags) in POSIX.
export function fd_fdstat_set_flags(fd: Fd, flags: Value<Fdflags>): Errno {
  if (!fdstats[fd]) {
    return Errno.Badf;
  }

  fdstats[fd] = new Fdstat({
    ...fdstats[fd],
    fs_flags: new Fdflags(flags),
  });
  return Errno.Success;
}

// fd_prestat_get(fd: fd) -> Result<prestat, errno>
//
// Return a description of the given preopened file descriptor.
export function fd_prestat_get(_fd: Fd, _result: Pointer<Prestat>): Errno {
  return Errno.Notsup;
}

// fd_prestat_dir_name(fd: fd, path: Pointer<u8>, path_len: size) -> Result<(), errno>
//
// Return a description of the given preopened file descriptor.
export function fd_prestat_dir_name(
  _fd: Fd,
  _path: Pointer<U8>,
  _path_len: Size,
): Errno {
  return Errno.Nosys;
}

export const Module = {
  sched_yield,
  proc_exit,
  args_get,
  args_sizes_get,
  clock_time_get,
  environ_get,
  environ_sizes_get,
  fd_write,
  random_get,
  poll_oneoff,
  fd_close,
  fd_filestat_get,
  fd_pread,
  fd_pwrite,
  fd_read,
  fd_fdstat_get,
  fd_fdstat_set_flags,
  fd_prestat_get,
  fd_prestat_dir_name,
};

export type Module = typeof Module;

export function init(
  init: {
    memory: WebAssembly.Memory;
    args?: Arg[];
    envs?: Env[];
    stdout?: (str: string) => void;
    stderr?: (str: string) => void;
  },
) {
  memory = init.memory;
  args = init.args ?? [];
  envs = init.envs ?? [];
  stdout = init.stdout ?? ((str) => console.log(str));
  stderr = init.stderr ?? ((str) => console.error(str));
}

export default init;
