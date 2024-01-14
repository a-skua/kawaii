import {
  BigValue,
  Ciovec,
  CiovecArray,
  Clockid,
  Dircookie,
  Errno,
  Event,
  EventFdReadwrite,
  Exitcode,
  Fd,
  Fdflags,
  Fdstat,
  Filesize,
  Filestat,
  Filetype,
  IovecArray,
  Lookupflags,
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
export function sched_yield(): Value<Errno> {
  return Errno.nosys;
}

// proc_exit(rval: exitcode)
//
// Terminate the process normally. An exit code of 0 indicates successful
// termination of the program. The meanings of other values is dependent on the
// environment.
export function proc_exit(rval: Value<Exitcode>) {
  throw new Exit(new Exitcode(rval));
}

// args_get(argv: Pointer<Pointer<u8>>, argv_buf: Pointer<u8>) -> Result<(), errno>
//
// Read command-line argument data. The size of the array should match that
// returned by args_sizes_get. Each argument is expected to be \0 terminated.
export function args_get(
  argv: Pointer<Pointer<U8<string>>>,
  argv_buf: Pointer<U8<string>>,
): Value<Errno> {
  const data = new DataView(memory.buffer);
  const array = new Uint8Array(memory.buffer);

  for (const arg of args) {
    data.setUint32(argv, argv_buf, true);
    argv = argv + 4 as Pointer<Pointer<U8<string>>>;
    const { written } = encoder.encodeInto(
      `${arg}\0`,
      array.subarray(argv_buf),
    );
    argv_buf = argv_buf + written as Pointer<U8<string>>;
  }
  return Errno.success;
}

// args_sizes_get() -> Result<(size, size), errno>
//
// Return command-line argument data sizes.
export function args_sizes_get(
  args_num: Pointer<Size>,
  buf_size: Pointer<Size>,
): Value<Errno> {
  const size = args.map((arg) => encoder.encode(`${arg}\0`).length).reduce((
    sum,
    len,
  ) => sum + len, 0);

  const data = new DataView(memory.buffer);
  data.setUint32(args_num, args.length, true);
  data.setUint32(buf_size, size, true);
  return Errno.success;
}

// clock_time_get(id: clockid, precision: timestamp) -> Result<timestamp, errno>
//
// Return the time value of a clock. Note: This is similar to clock_gettime in
// POSIX.
export function clock_time_get(
  id: Value<Clockid>,
  _precision: BigValue<Timestamp>,
  result: Pointer<Timestamp>,
): Value<Errno> {
  const clockid = new Clockid(id);
  if (clockid.realtime) {
    const ns = new Timestamp(
      BigInt(new Date().getTime()) * 1_000_000n as BigValue<Timestamp>,
    );
    ns.store(memory, result);
    return Errno.success;
  } else if (clockid.monotonic) {
    const ns = new Timestamp(
      BigInt(performance.now()) * 1_000_000n as BigValue<Timestamp>,
    );
    ns.store(memory, result);
    return Errno.success;
  } else {
    return Errno.notsup;
  }
}

// environ_get(environ: Pointer<Pointer<u8>>, environ_buf: Pointer<u8>) -> Result<(), errno>
//
// Read environment variable data. The sizes of the buffers should match that
// returned by `environ_sizes_get`. Key/value pairs are expected to be joined
// with `=`s, and terminated with `\0`s.
export function environ_get(
  environ: Pointer<Pointer<U8<string>>>,
  env_buf: Pointer<U8<string>>,
): Value<Errno> {
  const array = new Uint8Array(memory.buffer);

  for (let i = 0; i < envs.length; i += 1) {
    Pointer.store(env_buf, memory, environ, Pointer.size * i);

    const { written } = encoder.encodeInto(
      `${envs[i]}\0`,
      array.subarray(env_buf),
    );
    env_buf = env_buf + written as Pointer<U8<string>>;
  }
  return Errno.success;
}

// environ_sizes_get() -> Result<(size, size), errno>
//
// Return environment variable data sizes.
export function environ_sizes_get(
  env_num: Pointer<Size>,
  buf_size: Pointer<Size>,
): Value<Errno> {
  const size = envs.map((env) => encoder.encode(`${env}\0`).length).reduce((
    sum,
    len,
  ) => sum + len, 0);

  const data = new DataView(memory.buffer);
  data.setUint32(env_num, envs.length, true);
  data.setUint32(buf_size, size, true);
  return Errno.success;
}

// fd_write(fd: fd, iovs: ciovec_array) -> Result<size, errno>
//
// Write to a file descriptor. Note: This is similar to writev in POSIX.
//
// Like POSIX, any calls of write (and other functions to read or write) for a
// regular file by other threads in the WASI process should not be interleaved
// while write is executed.
export function fd_write(
  fd: Value<Fd>,
  iovs: Pointer<CiovecArray>,
  iovs_size: Value<Size>,
  result: Pointer<Size>,
): Value<Errno> {
  const array = new Uint8Array(memory.buffer);
  let str = "";
  let len = 0;

  for (let i = 0; i < iovs_size; i++) {
    const iov = Ciovec.cast(memory, iovs, Ciovec.size * i);

    str += decoder.decode(array.subarray(iov.buf, iov.buf + iov.len.value));
    len += iov.len.value;
  }

  switch (fd) {
    case Fd.stdout:
      stdout(str);
      break;
    case Fd.stderr:
      stderr(str);
      break;
    default:
      return Errno.badf;
  }

  const data = new DataView(memory.buffer);
  data.setUint32(result, len, true);
  return Errno.success;
}

// random_get(buf: Pointer<u8>, buf_len: size) -> Result<(), errno>
//
// Write high-quality random data into a buffer. This function blocks when the
// implementation is unable to immediately provide sufficient high-quality
// random data. This function may execute slowly, so when large mounts of random
// data are required, it's advisable to use this function to seed a
// pseudo-random number generator, rather than to provide the random data
// directly.
export function random_get(
  buf: Pointer<U8<string>>,
  len: Value<Size>,
): Value<Errno> {
  crypto.getRandomValues(new Uint8Array(memory.buffer, buf, len));
  return Errno.success;
}

// poll_oneoff(in: ConstPointer<subscription>, out: Pointer<event>, nsubscriptions: size) -> Result<size, errno>
//
// Concurrently poll for the occurrence of a set of events.
// If nsubscriptions is 0, returns errno::inval.
export function poll_oneoff(
  // The events to which to subscribe.
  ins: Pointer<Subscription>,
  // The events that have occurred.
  out: Pointer<Event>,
  // Both the number of subscriptions and events.
  nsubscriptions: Value<Size>,
  // The number of events stored.
  result: Pointer<Size>,
): Value<Errno> {
  if (nsubscriptions === 0) {
    return Errno.inval;
  }

  let count = 0;
  for (let i = 0; i < nsubscriptions; i += 1) {
    const subscription = Subscription.cast(memory, ins, Subscription.size * i);

    if (subscription.u.type.clock) {
      const event = new Event({
        userdata: subscription.userdata,
        error: new Errno(Errno.notsup), // TODO
        type: subscription.u.type,
        fd_readwrite: EventFdReadwrite.zero(),
      });
      event.store(memory, out);
      count += 1;
    } else if (subscription.u.type.fd_read || subscription.u.type.fd_write) {
      const event = new Event({
        userdata: subscription.userdata,
        error: new Errno(Errno.notsup), // TODO
        type: subscription.u.type,
        fd_readwrite: EventFdReadwrite.zero(),
      });
      event.store(memory, out);
      count += 1;
    }
    out = out + Event.size as Pointer<Event>;
  }

  const size = new Size(count as Value<Size>);
  size.store(memory, result);

  return Errno.success;
}

// fd_close(fd: fd) -> Result<(), errno>
//
// Close a file descriptor. Note: This is similar to close in POSIX.
export function fd_close(_fd: Fd): Value<Errno> {
  return Errno.nosys;
}

// fd_filestat_get(fd: fd) -> Result<filestat, errno>
//
// Return the attributes of an open file.
export function fd_filestat_get(
  _fd: Fd,
  _result: Pointer<Filestat>,
): Value<Errno> {
  return Errno.nosys;
}

// fd_pread(fd: fd, iovs: iovec_array, offset: filesize) -> Result<size, errno>
//
// Read from a file descriptor, without using and updating the file descriptor's
// offset. Note: This is similar to preadv in Linux (and other Unix-es).
export function fd_pread(
  _fd: Fd,
  _iovs: Pointer<IovecArray>,
  _offset: BigValue<Filesize>,
  _result: Pointer<Size>,
): Value<Errno> {
  return Errno.nosys;
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
  _offset: BigValue<Filesize>,
  _result: Pointer<Size>,
): Value<Errno> {
  return Errno.nosys;
}

// fd_read(fd: fd, iovs: iovec_array) -> Result<size, errno>
//
// Read from a file descriptor. Note: This is similar to readv in POSIX.
export function fd_read(
  _fd: Fd,
  _iovs: Pointer<IovecArray>,
  _result: Pointer<Size>,
): Value<Errno> {
  return Errno.nosys;
}

const fdstats = [
  // stdin
  new Fdstat({
    fs_filetype: new Filetype(Filetype.character_device),
    fs_flags: new Fdflags(Fdflags.nonblock),
    fs_rights_base: Rights.zero(),
    fs_rights_inheriting: Rights.zero(),
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
export function fd_fdstat_get(
  fd: Value<Fd>,
  result: Pointer<Fdstat>,
): Value<Errno> {
  if (!fdstats[fd]) {
    return Errno.badf;
  }

  fdstats[fd].store(memory, result);
  return Errno.success;
}

// fd_fdstat_set_flags(fd: fd, flags: fdflags) -> Result<(), errno>
//
// Adjust the flags associated with a file descriptor. Note: This is similar
// to fcntl(fd, F_SETFL, flags) in POSIX.
export function fd_fdstat_set_flags(
  fd: Value<Fd>,
  // The desired values of the file descriptor flags.
  flags: Value<Fdflags>,
): Value<Errno> {
  if (!fdstats[fd]) {
    return Errno.badf;
  }

  fdstats[fd] = new Fdstat({
    ...fdstats[fd],
    fs_flags: new Fdflags(flags),
  });
  return Errno.success;
}

// fd_prestat_get(fd: fd) -> Result<prestat, errno>
//
// Return a description of the given preopened file descriptor.
export function fd_prestat_get(
  _fd: Value<Fd>,
  _result: Pointer<Prestat>,
): Value<Errno> {
  return Errno.badf;
}

// fd_prestat_dir_name(fd: fd, path: Pointer<u8>, path_len: size) ->
// Result<(), errno>
//
// Return a description of the given preopened file descriptor.
export function fd_prestat_dir_name(
  _fd: Fd,
  _path: Pointer<U8<string>>,
  _path_len: Size,
): Value<Errno> {
  return Errno.nosys;
}

// fd_readdir(fd: fd, buf: Pointer<u8>, buf_len: size, cookie: dircookie) ->
// Result<size, errno>
//
// Read directory entries from a directory. When successful, the contents of
// the output buffer consist of a sequence of directory entries. Each directory
// entry consists of a dirent object, followed by dirent::d_namlen bytes holding
// the name of the directory entry. This function fills the output buffer as
// much as possible, potentially truncating the last directory entry. This
// allows the caller to grow its read buffer size in case it's too small to fit
// a single large directory entry, or skip the oversized directory entry.
export function fd_readdir(
  _fd: Value<Fd>,
  // The buffer where directory entries are stored
  _buf: Pointer<U8<string>>,
  _buf_len: Value<Size>,
  // The location within the directory to start reading
  _cookie: BigValue<Dircookie>,
): Value<Errno> {
  return Errno.notsup;
}

// Return the attributes of a file or directory. Note: This is similar to stat
// in POSIX.
export function path_filestat_get(
  _fd: Value<Fd>,
  // Flags determining the method of how the path is resolved.
  _flags: Value<Lookupflags>,
  // The path of the file or directory to inspect.
  path_buf: Pointer<U8<string>>,
  path_len: Value<Size>,
  // The buffer where the file's attributes are stored.
  _result: Pointer<Filestat>,
): Value<Errno> {
  const path = decoder.decode(
    new Uint8Array(memory.buffer, path_buf, path_len),
  );
  console.debug("DEBUG", "path:", path, path.length);
  return Errno.notsup;
}

// TODO
export function path_open(): Value<Errno> {
  return Errno.notsup;
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
  fd_readdir,
  path_filestat_get,
  path_open,
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
