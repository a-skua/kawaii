import {
  type Ciovec,
  type Clockid,
  Errno,
  Exit,
  type Exitcode,
  type Fd,
  type Fdflags,
  type Fdstat,
  type Pointer,
  type Prestat,
  type Size,
  type Subscription,
  type Timestamp,
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
  for (const arg of _args) {
    _memory.setUint32(argv, argv_buf, true);
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
  const size = _args.reduce((acc, arg) => acc + arg.length, 0);

  _memory.setUint32(args_num, _args.length, true);
  _memory.setUint32(buf_size, size, true);
  return Errno.success;
}

/**
 * Return the time value of a clock. Note: This is similar to `clock_gettime` in
 * POSIX.
 */
export function clock_time_get(
  _id: Clockid,
  _precision: Timestamp,
  _result: Pointer<Timestamp>,
): Errno {
  // TODO
  return Errno.notsup;
}

/**
 * Read environment variable data. The sizes of the buffers should match that
 * returned by [environ_sizes_get]. Key/value pairs are expected to be joined
 * with `=`s, and terminated with `\0`s.
 */
export function environ_get(
  _environ: Pointer<Pointer<U8>>,
  _env_buf: Pointer<U8>,
): Errno {
  // TODO
  return Errno.success;
}

/**
 * Return environment variable data sizes.
 */
export function environ_sizes_get(
  _env_num: Pointer<Size>,
  _buf_size: Pointer<Size>,
): Errno {
  // TODO
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
  // TODO
  _fd: Fd,
  iovs: Pointer<Ciovec>,
  iovs_size: Size,
  result: Pointer<Size>,
): Errno {
  let str = "";
  let len = 0;

  for (let i = 0; i < iovs_size; i++) {
    const iov = iovs + i * 8;
    const buf = _memory.getUint32(iov, true);
    const buf_len = _memory.getUint32(iov + 4, true);

    str += _decoder.decode(new Uint8Array(_memory.buffer, buf, buf_len));
    len += buf_len;
  }

  console.debug(str);
  _memory.setUint32(result, len, true);
  return Errno.success;
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
  _buf: Pointer<U8>,
  _len: Size,
): Errno {
  // TODO
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
  _fd: Fd,
  _result: Pointer<Fdstat>,
): Errno {
  // TODO
  return Errno.success;
}

/**
 * Adjust the flags associated with a file descriptor. Note: This is similar to
 * fcntl(fd, F_SETFL, flags) in POSIX.
 */
export function fd_fdstat_set_flags(
  _fd: Fd,
  _flags: Fdflags,
): Errno {
  // TODO
  return Errno.success;
}

/**
 * Return a description of the given preopened file descriptor.
 */
export function fd_prestat_get(
  _fd: Fd,
  _result: Pointer<Prestat>,
): Errno {
  // TODO
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

let _memory: DataView;
let _args: Uint8Array[];
const _encoder = new TextEncoder();
const _decoder = new TextDecoder();

/**
 * @param memory The memory instance of the WebAssembly module.
 */
export function _init(memory: WebAssembly.Memory, args: string[]): void {
  _memory = new DataView(memory.buffer);
  _args = args.map((arg) => _encoder.encode(`${arg}\0`));
}
