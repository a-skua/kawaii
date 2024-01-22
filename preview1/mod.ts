import * as FS from "./fs.ts";
export * as FS from "./fs.ts";

import {
  BigValue,
  Ciovec,
  CiovecArray,
  Clockid,
  Data,
  Dircookie,
  Dirent,
  Errno,
  Event,
  EventFdReadwrite,
  Exitcode,
  Fd,
  Fdflags,
  Fdstat,
  Filesize,
  Filestat,
  IovecArray,
  Lookupflags,
  Oflags,
  Pointer,
  Preopentype,
  Prestat,
  PrestatDir,
  Rights,
  Size,
  Subscription,
  Timestamp,
  U8,
  Value,
} from "./type.ts";
export * as Type from "./type.ts";

let memory: WebAssembly.Memory;
let args: Arg[];
let envs: Env[];

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
export function sched_yield(): Value<number, Errno> {
  return Errno.nosys;
}

// proc_exit(rval: exitcode)
//
// Terminate the process normally. An exit code of 0 indicates successful
// termination of the program. The meanings of other values is dependent on the
// environment.
export function proc_exit(rval: Value<number, Exitcode>): void {
  throw new Exit(new Exitcode(rval));
}

// args_get(argv: Pointer<Pointer<u8>>, argv_buf: Pointer<u8>) -> Result<(), errno>
//
// Read command-line argument data. The size of the array should match that
// returned by args_sizes_get. Each argument is expected to be \0 terminated.
export function args_get(
  argv: Value<number, Pointer<Pointer<U8<string>>>>,
  argv_buf: Value<number, Pointer<U8<string>>>,
): Value<number, Errno> {
  const data = new DataView(memory.buffer);
  const array = new Uint8Array(memory.buffer);

  for (const arg of args) {
    data.setUint32(argv, argv_buf, true);
    argv = argv + 4 as Value<number, Pointer<Pointer<U8<string>>>>;
    const { written } = encoder.encodeInto(
      `${arg}\0`,
      array.subarray(argv_buf),
    );
    argv_buf = argv_buf + written as Value<number, Pointer<U8<string>>>;
  }
  return Errno.success;
}

// args_sizes_get() -> Result<(size, size), errno>
//
// Return command-line argument data sizes.
export function args_sizes_get(
  args_num: Value<number, Pointer<Size>>,
  buf_size: Value<number, Pointer<Size>>,
): Value<number, Errno> {
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
  id: Value<number, Clockid>,
  _precision: BigValue<Timestamp>,
  result: Value<number, Pointer<Timestamp>>,
): Value<number, Errno> {
  const clockid = new Clockid(id);
  if (clockid.realtime) {
    Timestamp.realtime().store(memory, new Pointer(result));
    return Errno.success;
  } else if (clockid.monotonic) {
    Timestamp.monotonic().store(memory, new Pointer(result));
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
  environ: Value<number, Pointer<Pointer<U8<string>>>>,
  env_buf: Value<number, Pointer<U8<string>>>,
): Value<number, Errno> {
  const array = new Uint8Array(memory.buffer);

  for (let i = 0; i < envs.length; i += 1) {
    new Pointer(env_buf).store(memory, new Pointer(environ), Pointer.size * i);

    const { written } = encoder.encodeInto(
      `${envs[i]}\0`,
      array.subarray(env_buf),
    );
    env_buf = env_buf + written as Value<number, Pointer<U8<string>>>;
  }
  return Errno.success;
}

// environ_sizes_get() -> Result<(size, size), errno>
//
// Return environment variable data sizes.
export function environ_sizes_get(
  env_num: Value<number, Pointer<Size>>,
  buf_size: Value<number, Pointer<Size>>,
): Value<number, Errno> {
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
  fd: Value<number, Fd>,
  iovs: Value<number, Pointer<CiovecArray>>,
  iovs_size: Value<number, Size>,
  result: Value<number, Pointer<Size>>,
): Value<number, Errno> {
  let str = "";
  let len = 0;

  for (let i = 0; i < iovs_size; i++) {
    const iov = Ciovec.cast(memory, new Pointer(iovs), Ciovec.size * i);

    str += decoder.decode(
      new Uint8Array(memory.buffer, iov.buf.value, iov.buf_len.value),
    );
    len += iov.buf_len.value;
  }

  const state = FS.find(new Fd(fd));
  if (!state) {
    return Errno.badf;
  }

  state.write(str);
  (new Size(len)).store(memory, new Pointer(result));

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
  buf: Value<number, Pointer<U8<string>>>,
  len: Value<number, Size>,
): Value<number, Errno> {
  crypto.getRandomValues(new Uint8Array(memory.buffer, buf, len));
  return Errno.success;
}

// poll_oneoff(in: ConstPointer<subscription>, out: Pointer<event>, nsubscriptions: size) -> Result<size, errno>
//
// Concurrently poll for the occurrence of a set of events.
// If nsubscriptions is 0, returns errno::inval.
export function poll_oneoff(
  // The events to which to subscribe.
  ins: Value<number, Pointer<Subscription>>,
  // The events that have occurred.
  out: Value<number, Pointer<Event>>,
  // Both the number of subscriptions and events.
  nsubscriptions: Value<number, Size>,
  // The number of events stored.
  result: Value<number, Pointer<Size>>,
): Value<number, Errno> {
  if (nsubscriptions === 0) {
    return Errno.inval;
  }

  let count = 0;
  for (let i = 0; i < nsubscriptions; i += 1) {
    const subscription = Subscription.cast(
      memory,
      new Pointer(ins),
      Subscription.size * i,
    );

    if (subscription.u.type.clock) {
      const event = new Event({
        userdata: subscription.userdata,
        error: new Errno(Errno.notsup), // TODO
        type: subscription.u.type,
        fd_readwrite: EventFdReadwrite.zero(),
      });
      event.store(memory, new Pointer(out));
      count += 1;
    } else if (subscription.u.type.fd_read || subscription.u.type.fd_write) {
      const event = new Event({
        userdata: subscription.userdata,
        error: new Errno(Errno.notsup), // TODO
        type: subscription.u.type,
        fd_readwrite: EventFdReadwrite.zero(),
      });
      event.store(memory, new Pointer(out));
      count += 1;
    }
    out = out + Event.size as Value<number, Pointer<Event>>;
  }

  const size = new Size(count);
  size.store(memory, new Pointer(result));

  return Errno.success;
}

// fd_close(fd: fd) -> Result<(), errno>
//
// Close a file descriptor. Note: This is similar to close in POSIX.
export function fd_close(fd: Value<number, Fd>): Value<number, Errno> {
  FS.close(new Fd(fd));
  return Errno.success;
}

// fd_filestat_get(fd: fd) -> Result<filestat, errno>
//
// Return the attributes of an open file.
export function fd_filestat_get(
  _fd: Value<number, Fd>,
  _result: Value<number, Pointer<Filestat>>,
): Value<number, Errno> {
  return Errno.nosys;
}

// fd_pread(fd: fd, iovs: iovec_array, offset: filesize) -> Result<size, errno>
//
// Read from a file descriptor, without using and updating the file descriptor's
// offset. Note: This is similar to preadv in Linux (and other Unix-es).
export function fd_pread(
  _fd: Value<number, Fd>,
  _iovs: Value<number, Pointer<IovecArray>>,
  _offset: BigValue<Filesize>,
  _result: Value<number, Pointer<Size>>,
): Value<number, Errno> {
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
  _fd: Value<number, Fd>,
  _iovs: Value<number, Pointer<CiovecArray>>,
  _offset: BigValue<Filesize>,
  _result: Value<number, Pointer<Size>>,
): Value<number, Errno> {
  return Errno.nosys;
}

// fd_read(fd: fd, iovs: iovec_array) -> Result<size, errno>
//
// Read from a file descriptor. Note: This is similar to readv in POSIX.
export function fd_read(
  fd: Value<number, Fd>,
  // List of scatter/gather vectors to which to store data.
  iovs: Value<number, Pointer<IovecArray>>,
  iovs_size: Value<number, Size>,
  // The number of bytes read.
  result: Value<number, Pointer<Size>>,
): Value<number, Errno> {
  const state = FS.find(new Fd(fd));
  if (!state) {
    return Errno.badf;
  }

  let read_size = 0;
  for (let i = 0; i < iovs_size; i += 1) {
    const iov = IovecArray.cast(memory, new Pointer(iovs), IovecArray.size * i);
    const read = state.read();
    new Uint8Array(memory.buffer, iov.buf.value, iov.buf_len.value).set(
      read.blob,
    );
    read_size += read.blob.length;
  }

  new Size(read_size).store(memory, new Pointer(result));
  return Errno.success;
}

// fd_fdstat_get(fd: fd) -> Result<fdstat, errno>
//
// Get the attributes of a file descriptor. Note: This returns similar flags
// to fcntl(fd, F_GETFL) in POSIX, as well as additional fields.
export function fd_fdstat_get(
  fd: Value<number, Fd>,
  result: Value<number, Pointer<Fdstat>>,
): Value<number, Errno> {
  const state = FS.find(new Fd(fd));
  if (!state) {
    return Errno.badf;
  }

  state.file.wasi_fdstat().store(memory, new Pointer(result));
  return Errno.success;
}

// fd_fdstat_set_flags(fd: fd, flags: fdflags) -> Result<(), errno>
//
// Adjust the flags associated with a file descriptor. Note: This is similar
// to fcntl(fd, F_SETFL, flags) in POSIX.
export function fd_fdstat_set_flags(
  fd: Value<number, Fd>,
  // The desired values of the file descriptor flags.
  flags: Value<number, Fdflags>,
): Value<number, Errno> {
  const state = FS.find(new Fd(fd));
  if (!state) {
    return Errno.badf;
  }

  state.file.wasi_fs_flags = new Fdflags(flags); // FIXME
  return Errno.success;
}

// fd_prestat_get(fd: fd) -> Result<prestat, errno>
//
// Return a description of the given preopened file descriptor.
export function fd_prestat_get(
  fd: Value<number, Fd>,
  // The buffer where the description is stored.
  result: Value<number, Pointer<Prestat>>,
): Value<number, Errno> {
  const state = FS.find(new Fd(fd));
  if (!state) {
    return Errno.badf;
  }

  new Prestat({
    type: new Preopentype(Preopentype.dir),
    content: new PrestatDir({
      pr_name_len: new Size(state.file.fullName.length), // TODO
    }),
  }).store(memory, new Pointer(result));
  return Errno.success;
}

// fd_prestat_dir_name(fd: fd, path: Pointer<u8>, path_len: size) ->
// Result<(), errno>
//
// Return a description of the given preopened file descriptor.
export function fd_prestat_dir_name(
  fd: Value<number, Fd>,
  path: Value<number, Pointer<U8<string>>>,
  path_len: Value<number, Size>,
): Value<number, Errno> {
  const state = FS.find(new Fd(fd));
  if (!state) {
    return Errno.badf;
  }

  encoder.encodeInto(
    state.file.fullName,
    new Uint8Array(memory.buffer, path, path_len),
  );
  return Errno.success;
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
  fd: Value<number, Fd>,
  // The buffer where directory entries are stored
  buf: Value<number, Pointer<U8<string>>>,
  buf_len: Value<number, Size>,
  // The location within the directory to start reading
  cookie: BigValue<Dircookie>,
  // The number of bytes stored in the read buffer. If less than the size of the
  // read buffer, the end of the directory has been reached.
  result: Value<number, Pointer<Size>>,
): Value<number, Errno> {
  const state = FS.find(new Fd(fd));
  if (!state) {
    return Errno.badf;
  }

  const offset = new Dircookie(cookie);
  const children = state.file.children.slice(offset.number);
  if (!children.length) {
    new Size(0).store(memory, new Pointer(result));
    return Errno.success;
  }

  const child = children[0];
  child.wasi_dirent(offset.next()).store(
    memory,
    new Pointer(buf),
  );

  const { written } = encoder.encodeInto(
    child.name.value,
    new Uint8Array(memory.buffer, buf + Dirent.size, buf_len - Dirent.size),
  );
  new Size(Dirent.size + written).store(memory, new Pointer(result));
  return Errno.success;
}

// Return the attributes of a file or directory. Note: This is similar to `stat`
// in POSIX.
export function path_filestat_get(
  fd: Value<number, Fd>,
  // Flags determining the method of how the path is resolved.
  _flags: Value<number, Lookupflags>,
  // The path of the file or directory to inspect.
  path_buf: Value<number, Pointer<U8<string>>>,
  path_len: Value<number, Size>,
  // The buffer where the file's attributes are stored.
  result: Value<number, Pointer<Filestat>>,
): Value<number, Errno> {
  const path = decoder.decode(
    new Uint8Array(memory.buffer, path_buf, path_len),
  );

  const state = FS.find(new Fd(fd));
  if (!state) {
    return Errno.badf;
  }

  const file = state.file.find(path);
  if (!file) {
    return Errno.noent;
  }

  file.wasi_filestat().store(memory, new Pointer(result));
  return Errno.success;
}

// Open a file or directory. The returned file descriptor is not guaranteed to
// be the lowest-numbered file descriptor not currently open; it is randomized
// to prevent applications from depending on making assumptions about indexes,
// since this is error-prone in multi-threaded contexts. The returned file
// descriptor is guaranteed to be less than 2**31. Note: This is similar to
// `openat` in POSIX.
export function path_open(
  fd: Value<number, Fd>,
  // Flags determining the method of how the path is resolved.
  _dirflags: Value<number, Lookupflags>,
  // The relative path of the file or directory to open, relative to the
  // `path_open::fd` directory.
  path_buf: Value<number, Pointer<U8<string>>>,
  path_len: Value<number, Size>,
  // The method by which to open the file.
  oflags: Value<number, Oflags>,
  // The initial rights of the newly created file descriptor. The implementation
  // is allowed to return a file descriptor with fewer rights than specified, if
  // and only if those rights do not apply to the type of file being opened. The
  // base rights are rights that will apply to operations using the file
  // descriptor itself, while the inheriting rights are rights that apply to
  // file descriptors derived from it.
  _fs_rights_base: BigValue<Rights>,
  _fs_rights_inheriting: BigValue<Rights>,
  fdflags: Value<number, Fdflags>,
  // The file descriptor of the file that has been opened.
  result: Value<number, Pointer<Fd>>,
): Value<number, Errno> {
  const path = decoder.decode(
    new Uint8Array(memory.buffer, path_buf, path_len),
  );

  const state = FS.find(new Fd(fd));
  if (!state) {
    return Errno.badf;
  }

  const fdFlags = new Fdflags(fdflags);

  const file = state.file.find(path);
  const flags = new Oflags(oflags);
  console.debug("path_open", path, `${flags}`);

  if (!file && flags.creat) {
    const file = new FS.File({
      name: new FS.FileName(path),
      type: FS.File.type.regularFile,
    });
    state.file.append(file);
    FS.open(file, fdFlags).store(memory, new Pointer(result));
    return Errno.success;
  }

  if (!file) {
    return Errno.noent;
  }

  if (file && flags.excl) {
    return Errno.exist;
  }

  FS.open(file, fdFlags).store(memory, new Pointer(result));
  return Errno.success;
}

export function path_readlink(): Value<number, Errno> {
  return Errno.nosys;
}

export function path_remove_directory(): Value<number, Errno> {
  return Errno.nosys;
}

// Unlink a file. Return errno::isdir if the path refers to a directory. Note:
// This is similar to `unlinkat(fd, path, 0)` in POSIX.
export function path_unlink_file(
  fd: Value<number, Fd>,
  // The path to a file to unlink.
  path_buf: Value<number, Pointer<U8<string>>>,
  path_len: Value<number, Size>,
): Value<number, Errno> {
  const path = decoder.decode(
    new Uint8Array(memory.buffer, path_buf, path_len),
  );

  const state = FS.find(new Fd(fd));
  if (!state) {
    return Errno.badf;
  }

  const file = state.file.find(path);
  if (!file) {
    return Errno.noent;
  }

  if (file.type.dir) {
    return Errno.isdir;
  }

  state.file.remove(file);
  return Errno.success;
}

export function sock_accept(): Value<number, Errno> {
  return Errno.nosys;
}

export function sock_shutdown(): Value<number, Errno> {
  return Errno.nosys;
}

type Keys =
  | "sched_yield"
  | "proc_exit"
  | "args_get"
  | "args_sizes_get"
  | "clock_time_get"
  | "environ_get"
  | "environ_sizes_get"
  | "fd_write"
  | "random_get"
  | "poll_oneoff"
  | "fd_close"
  | "fd_filestat_get"
  | "fd_pread"
  | "fd_pwrite"
  | "fd_read"
  | "fd_fdstat_get"
  | "fd_fdstat_set_flags"
  | "fd_prestat_get"
  | "fd_prestat_dir_name"
  | "fd_readdir"
  | "path_filestat_get"
  | "path_open"
  | "path_readlink"
  | "path_remove_directory"
  | "path_unlink_file"
  | "sock_accept"
  | "sock_shutdown";

type Fn = (
  ...args: Value<number | bigint, Data<string>>[]
) => Value<number, Errno> | void;

export const Module: Record<Keys, Fn> = {
  sched_yield: sched_yield as Fn,
  proc_exit: proc_exit as Fn,
  args_get: args_get as Fn,
  args_sizes_get: args_sizes_get as Fn,
  clock_time_get: clock_time_get as Fn,
  environ_get: environ_get as Fn,
  environ_sizes_get: environ_sizes_get as Fn,
  fd_write: fd_write as Fn,
  random_get: random_get as Fn,
  poll_oneoff: poll_oneoff as Fn,
  fd_close: fd_close as Fn,
  fd_filestat_get: fd_filestat_get as Fn,
  fd_pread: fd_pread as Fn,
  fd_pwrite: fd_pwrite as Fn,
  fd_read: fd_read as Fn,
  fd_fdstat_get: fd_fdstat_get as Fn,
  fd_fdstat_set_flags: fd_fdstat_set_flags as Fn,
  fd_prestat_get: fd_prestat_get as Fn,
  fd_prestat_dir_name: fd_prestat_dir_name as Fn,
  fd_readdir: fd_readdir as Fn,
  path_filestat_get: path_filestat_get as Fn,
  path_open: path_open as Fn,
  path_readlink: path_readlink as Fn,
  path_remove_directory: path_remove_directory as Fn,
  path_unlink_file: path_unlink_file as Fn,
  sock_accept: sock_accept as Fn,
  sock_shutdown: sock_shutdown as Fn,
};

export type Module = typeof Module;

export function init(
  init: {
    memory: WebAssembly.Memory;
    args?: Arg[];
    envs?: Env[];
  },
) {
  memory = init.memory;
  args = init.args ?? [];
  envs = init.envs ?? [];
}

export default init;
