import * as FS from "./fs.ts";
import {
  type Ciovec,
  Clockid,
  Errno,
  Exit,
  type Exitcode,
  type Fd,
  Fdflags,
  Fdstat,
  Iovec,
  type Pointer,
  Prestat,
  type Size,
  type Subscription,
  Timestamp,
  type U8,
} from "./types.ts";

/**
 * Temporarily yield execution of the calling thread. Note: This is similar to
 * sched_yield in POSIX.
 */
export function sched_yield(): Errno {
  return Errno.nosys;
}

/**
 * Terminate the process normally. An exit code of 0 indicates successful
 * termination of the program. The meanings of other values is dependent on the
 * environment.
 *
 * @param rval exitcode The exit code returned by the process.
 */
export function proc_exit(rval: Exitcode): void {
  throw new Exit(rval);
}

/**
 * Read command-line argument data. The size of the array should match that
 * returned by {@link args_sizes_get}. Each argument is expected to be `\0` terminated.
 *
 * @param argv
 * @param argv_buf
 *
 * @returns `Result<(), errno>`
 *
 * ## Variant Layout
 *
 * - size: 8
 * - align: 4
 * - tag_size: 4
 *
 * ### Variant cases
 *
 * - ok
 * - err: errno
 *
 * @param argv The buffer to write the argument data to.
 */
export function args_get(
  argv: Pointer<Pointer<U8>>,
  argv_buf: Pointer<U8>,
): Errno {
  const memory = new DataView(_memory.buffer);

  for (const arg of _args) {
    memory.setUint32(argv, argv_buf, true);
    argv = argv + 4;

    new Uint8Array(_memory.buffer, argv_buf, arg.length).set(arg);
    argv_buf += arg.length;
  }

  return Errno.success;
}

/**
 * Return command-line argument data sizes.
 *
 * @returns `Result<(size, size), errno>` Returns the number of arguments and
 * the size of the argument string data, or an error.
 *
 * ## Variant Layout
 *
 * - size: 12
 * - align: 4
 * - tag_size: 4
 *
 * ### Variant cases
 *
 * - ok: (size, size)
 * - err: errno
 *
 * ### Record members
 * - 0: size
 *   - Offset: 0
 *
 * - 1: size
 *   - Offset: 4
 */
export function args_sizes_get(
  args_num: Pointer<Size>,
  buf_size: Pointer<Size>,
): Errno {
  const memory = new DataView(_memory.buffer);
  const len: number = _args.length;
  const size: number = _args.reduce((acc, arg) => acc + arg.length, 0);

  memory.setUint32(args_num, len, true);
  memory.setUint32(buf_size, size, true);
  return Errno.success;
}

/**
 * Return the time value of a clock. Note: This is similar to `clock_gettime` in
 * POSIX.
 *
 * @param id clockid The clock for which to return the time.
 * @param precision timestamp The maximum lag (exclusive) that the returned time
 * value may have, compared to its actual value.
 *
 * @returns `Result<timestamp, errno>` The time value of the clock.
 *
 * ## Variant Layout
 *
 * - size: 16
 * - align: 8
 * - tag_size: 4
 *
 * ### Variant cases
 *
 * - ok: timestamp
 * - err: errno
 */
export function clock_time_get(
  id: Clockid,
  _precision: Timestamp,
  result: Pointer<Timestamp>,
): Errno {
  const memory = new DataView(_memory.buffer);

  switch (id) {
    case Clockid.realtime:
      memory.setBigUint64(result, Timestamp.realtime(), true);
      return Errno.success;
    case Clockid.monotonic:
      memory.setBigUint64(result, Timestamp.monotonic(), true);
      return Errno.success;
    default:
      return Errno.notsup;
  }
}

/**
 * Read environment variable data. The sizes of the buffers should match that
 * returned by [environ_sizes_get]. Key/value pairs are expected to be joined
 * with `=`s, and terminated with `\0`s.
 */
export function environ_get(
  environ: Pointer<Pointer<U8>>,
  env_buf: Pointer<U8>,
): Errno {
  const memory = new DataView(_memory.buffer);

  for (const env of _env) {
    memory.setUint32(environ, env_buf, true);
    environ += 4;

    new Uint8Array(_memory.buffer, env_buf, env.length).set(env);
    env_buf += env.length;
  }
  return Errno.success;
}

/**
 * Return environment variable data sizes.
 *
 * @returns `Result<(size, size), errno>` Returns the number of environment
 * variable arguments and the size of the environment variable data.
 *
 * ## Variant Layout
 *
 * - size: 12
 * - align: 4
 * - tag_size: 4
 *
 * ### Variant cases
 *
 * - ok: (size, size)
 * - err: errno
 *
 * ### Record members
 *
 * - 0: size
 *   - Offset: 0
 * - 1: size
 *   - Offset: 4
 */
export function environ_sizes_get(
  env_num: Pointer<Size>,
  buf_size: Pointer<Size>,
): Errno {
  const memory = new DataView(_memory.buffer);
  const len: number = _env.length;
  const size: number = _env.reduce((acc, env) => acc + env.length, 0);

  memory.setUint32(env_num, len, true);
  memory.setUint32(buf_size, size, true);
  return Errno.success;
}

/**
 * Write to a file descriptor. Note: This is similar to `writev` in POSIX.
 *
 * Like POSIX, any calls of `write` (and other functions to read or write) for a
 * regular file by other threads in the WASI process should not be interleaved
 * while `write` is executed.
 *
 * @param fd {@link Fd}
 * @param iovs ciovec_array List of scatter/gather vectors from which to retrieve data.
 * @param iovs_size ciovec_array List of scatter/gather vectors from which to retrieve data.
 *
 * @returns `Result<size, errno>`
 *
 * ## Variant Layout
 *
 * - size: 8
 * - align: 4
 * - tag_size: 4
 *
 * ### Variant cases
 *
 * - ok: size
 * - err: errno
 */
export function fd_write(
  _fd: Fd, // TODO
  iovs: Pointer<Ciovec>,
  iovs_size: Size,
  result: Pointer<Size>,
): Errno {
  const memory = new DataView(_memory.buffer);
  let str = "";
  let len = 0;

  for (let i = 0; i < iovs_size; i++) {
    const iov = iovs + i * 8;
    const buf = memory.getUint32(iov, true);
    const buf_len = memory.getUint32(iov + 4, true);
    const source = new Uint8Array(memory.buffer, buf, buf_len);

    str += _decoder.decode(source);
    len += buf_len;
  }

  console.debug(str); // FIXME
  memory.setUint32(result, len, true);
  return Errno.success;
}

/**
 * Read from a file descriptor. Note: This is similar to readv in POSIX.
 *
 * @param fd
 * @param iovs iovec_array List of scatter/gather vectors to which to store data.
 *
 * @returns `Result<size, errno>` The number of bytes read.
 *
 * ## Variant Layout
 *
 * - size: 8
 * - align: 4
 * - tag_size: 4
 *
 * ### Variant cases
 *
 * - ok: size
 * - err: errno
 */

export function fd_read(
  _id: Fd, // TODO
  iovs: Pointer<Iovec>,
  iovs_len: Size,
  result: Pointer<Size>,
): Errno {
  const memory = new DataView(_memory.buffer);

  let read_size = 0;
  for (let i = 0; i < iovs_len; i += 1) {
    const iov = iovs + i * Iovec.size;
    const buf = memory.getUint32(iov, true);
    const buf_len = memory.getUint32(iov + 4, true);
    const read = prompt(); // FIXME
      if (read === null) {
        return Errno.io;
      }

    const { written } = _encoder.encodeInto(read, new Uint8Array(_memory.buffer, buf, buf_len));
    read_size += written;
  }

  memory.setUint32(result, read_size, true);
  return Errno.success;
}

/**
 * Return the attributes of a file or directory. Note: This is similar to `stat`
 * in POSIX.
 *
 * @param fd
 * @param flags `lookupflags` Flags determining the method of how the path is
 * resolved.
 * @param path `string` The path of the file or directory to inspect.
 *
 * @returns `Result<filestat, errno>` The buffer where the file's attributes are
 * stored.
 *
 * ## Variant Layout
 *
 * - size: 72
 * - align: 8
 * - tag_size: 4
 *
 * ### Variant cases
 *
 * - ok: filestat
 * - err: errno
 */
export function path_filestat_get() {
  // TODO
  return Errno.success;
}

/**
 * Open a file or directory. The returned file descriptor is not guaranteed to
 * be the lowest-numbered file descriptor not currently open; it is randomized
 * to prevent applications from depending on making assumptions about indexes,
 * since this is error-prone in multi-threaded contexts. The returned file
 * descriptor is guaranteed to be less than 2**31. Note: This is similar to
 * `openat` in POSIX.
 *
 * @param fd
 * @param dirflags Flags determining the method of how the path is resolved.
 * @param path The relative path of the file or directory to open, relative to
 * the path_open::fd directory.
 * @param oflags The method by which to open the file.
 * @param fs_rights_base The initial rights of the newly created file
 * descriptor. The implementation is allowed to return a file descriptor with
 * fewer rights than specified, if and only if those rights do not apply to the
 * type of file being opened. The base rights are rights that will apply to
 * operations using the file descriptor itself, while the inheriting rights are
 * rights that apply to file descriptors derived from it.
 * @param fs_rights_inheriting
 * @param fdflags
 *
 * @returns `Result<fd, errno>` The file descriptor of the file that has been
 * opened.
 *
 * ## Variant Layout
 *
 * - size: 8
 * - align: 4
 * - tag_size: 4
 *
 * ### Variant cases
 *
 * - ok: fd
 * - err: errno
 */
export function path_open() {
  // TODO
  return Errno.badf;
}

/**
 * Write high-quality random data into a buffer. This function blocks when the
 * implementation is unable to immediately provide sufficient high-quality
 * random data. This function may execute slowly, so when large mounts of random
 * data are required, it's advisable to use this function to seed a
 * pseudo-random number generator, rather than to provide the random data
 * directly.
 */
export function random_get(
  buf: Pointer<U8>,
  len: Size,
): Errno {
  const memory = new Uint8Array(_memory.buffer, buf, len);

  crypto.getRandomValues(memory);
  return Errno.success;
}

/**
 * Concurrently poll for the occurrence of a set of events.
 *
 * If nsubscriptions is 0, returns errno::inval.
 */
export function poll_oneoff(
  _ins: Pointer<Subscription>,
  _out: Pointer<Event>,
  _nsubscriptions: Size,
  _result: Pointer<Size>,
): Errno {
  // TODO
  return Errno.success;
}

/**
 * Close a file descriptor. Note: This is similar to close in POSIX.
 */
export function fd_close(_fd: Fd): Errno {
  // TODO
  return Errno.success;
}

/**
 * Get the attributes of a file descriptor. Note: This returns similar flags to
 * fcntl(fd, F_GETFL) in POSIX, as well as additional fields.
 */
export function fd_fdstat_get(
  fd: Fd,
  result: Pointer<Fdstat>,
): Errno {
  const fs = FS.get(fd);
  if (!fs) return Errno.badf;

  const memory = new DataView(_memory.buffer, result, Fdstat.size);
  Fdstat.fs_flags_set(memory, fs.fdflags); // TODO

  return Errno.success;
}

/**
 * Adjust the flags associated with a file descriptor. Note: This is similar to
 * `fcntl(fd, F_SETFL, flags)` in POSIX.
 *
 * @param fd
 * @param flags The desired values of the file descriptor flags.
 *
 * @returns `Result<(), errno>`
 *
 * ## Variant Layout
 *
 * - size: 8
 * - align: 4
 * - tag_size: 4
 *
 * ### Variant cases
 *
 * - ok
 * - err: errno
 */
export function fd_fdstat_set_flags(
  fd: Fd,
  flags: Fdflags,
): Errno {
  const fs = FS.get(fd);
  if (!fs) return Errno.badf;

  fs.fdflags = flags;
  return Errno.success;
}

/**
 * Return a description of the given preopened file descriptor.
 */
export function fd_prestat_get(
  fd: Fd,
  result: Pointer<Prestat>,
): Errno {
  const fs = FS.get(fd);
  if (!fs) return Errno.badf;

  const memory = new DataView(_memory.buffer, result, Prestat.size);
  Prestat.fs_flags_set(memory, fs.fdflags); // TODO

  return Errno.success;
}

/**
 * Return a description of the given preopened file descriptor.
 */
export function fd_prestat_dir_name(
  _fd: Fd,
  _path: Pointer<U8>,
  _path_len: Size,
): Errno {
  // TODO
  return Errno.success;
}

let _memory: WebAssembly.Memory;
let _args: Uint8Array[];
let _env: Uint8Array[];

const _encoder = new TextEncoder();
const _decoder = new TextDecoder();

export type Env = {
  args?: string[];
  env?: { [K in string]: string };
};

/**
 * @param memory The memory instance of the WebAssembly module.
 */
export default function (
  memory: WebAssembly.Memory,
  { args = [], env = { ENV: "TODO" } }: Env,
): void {
  _memory = memory;
  _args = args.map((arg) => _encoder.encode(`${arg}\0`));
  _env = Object.entries(env).map(([key, value]) =>
    _encoder.encode(`${key}=${value}\0`)
  );
}
