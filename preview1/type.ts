type Memory = WebAssembly.Memory;

export interface Data<T extends string> {
  readonly __data: T;
}

// Pointer
export type Pointer<T extends Data<string>> = number & { __pointer: T } & {
  __data: string;
};

type Offset = number;

const addOffset = <T extends Data<string>>(
  ptr: Pointer<T>,
  offset: Offset,
): Pointer<T> => (ptr + offset) as Pointer<T>;

export const Pointer = Object.freeze({
  size: 4,
  cast: <T extends Data<string>>(
    mem: Memory,
    ptr: Pointer<Pointer<T>>,
    offset: Offset = 0,
  ): Pointer<T> => {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), Pointer.size);
    return data.getUint32(0, true) as Pointer<T>;
  },
  store: <T extends Data<string>>(
    value: Pointer<T>,
    mem: Memory,
    ptr: Pointer<Pointer<T>>,
    offset: Offset = 0,
  ) => {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), Pointer.size);
    data.setUint32(0, value, true);
  },
});

// Value
export type Value<T extends Data<string>> = number & { __value: T };

// BigValue
export type BigValue<T extends Data<string>> = bigint & { __bigValue: T };

// U8
export abstract class U8<T extends string> implements Data<T> {
  abstract readonly __data: T;
  readonly __bites = 8;

  static readonly size = 1;
  static readonly alignment = 1;

  constructor(
    readonly value: Value<U8<T>>,
  ) {}

  store(mem: Memory, ptr: Pointer<U8<T>>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), U8.size);
    data.setUint8(0, this.value);
  }

  protected static getValue(
    mem: Memory,
    ptr: Pointer<U8<string>>,
    offset: Offset,
  ): Value<U8<string>> {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), U8.size);
    return data.getUint8(0) as Value<U8<string>>;
  }
}

abstract class U16<T extends string> implements Data<T> {
  abstract readonly __data: T;
  readonly __bites = 16;

  static readonly size = 2;
  static readonly alignment = 2;

  constructor(
    readonly value: Value<U16<T>>,
  ) {}

  store(mem: Memory, ptr: Pointer<U16<T>>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), U16.size);
    data.setUint16(0, this.value, true);
  }

  protected static getValue(
    mem: Memory,
    ptr: Pointer<U16<string>>,
    offset: Offset,
  ): Value<U16<string>> {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), U16.size);
    return data.getUint16(0, true) as Value<U16<string>>;
  }
}

abstract class U32<T extends string> implements Data<T> {
  abstract readonly __data: T;
  readonly __bites = 32;

  static readonly size = 4;
  static readonly alignment = 4;

  constructor(
    readonly value: Value<U32<T>>,
  ) {}

  store(mem: Memory, ptr: Pointer<U32<T>>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), U32.size);
    data.setUint32(0, this.value, true);
  }

  protected static getValue(
    mem: Memory,
    ptr: Pointer<U32<string>>,
    offset: Offset,
  ): Value<U32<string>> {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), U32.size);
    return data.getUint32(0, true) as Value<U32<string>>;
  }
}

abstract class U64<T extends string> implements Data<T> {
  abstract readonly __data: T;
  readonly __bites = 32;

  static readonly size = 8;
  static readonly alignment = 8;

  constructor(
    readonly value: BigValue<U64<T>>,
  ) {}

  store(mem: Memory, ptr: Pointer<U64<T>>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), U64.size);
    data.setBigUint64(0, this.value, true);
  }

  protected static getValue(
    mem: Memory,
    ptr: Pointer<U64<string>>,
    offset: Offset,
  ): BigValue<U64<string>> {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), U64.size);
    return data.getBigUint64(0, true) as BigValue<U64<string>>;
  }
}

// Size
export class Size extends U32<"size"> {
  readonly __data = "size";

  static cast(
    mem: Memory,
    ptr: Pointer<Size>,
    offset: Offset = 0,
  ): Size {
    return new Size(Size.getValue(mem, ptr, offset) as Value<Size>);
  }
}

// Non-negative file size or length of a region within a file.
export class Filesize extends U64<"filesize"> {
  readonly __data = "filesize";

  static zero(): Filesize {
    return new Filesize(0n as BigValue<Filesize>);
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Filesize>,
    offset: Offset = 0,
  ): Filesize {
    return new Filesize(
      Filesize.getValue(mem, ptr, offset) as BigValue<Filesize>,
    );
  }
}

// Timestamp in nanoseconds.
export class Timestamp extends U64<"timestamp"> {
  readonly __data = "timestamp";

  static realtime(): Timestamp {
    return new Timestamp(
      BigInt(new Date().getTime()) * 1_000_000n as BigValue<Timestamp>,
    );
  }

  static monotonic(): Timestamp {
    return new Timestamp(
      BigInt(performance.now()) * 1_000_000n as BigValue<Timestamp>,
    );
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Timestamp>,
    offset: Offset = 0,
  ): Timestamp {
    return new Timestamp(
      Timestamp.getValue(mem, ptr, offset) as BigValue<Timestamp>,
    );
  }

  store(mem: Memory, ptr: Pointer<Timestamp>, offset: Offset = 0) {
    const data = new DataView(
      mem.buffer,
      addOffset(ptr, offset),
      Timestamp.size,
    );
    data.setBigUint64(0, this.value, true);
  }
}

// Identifiers for clocks.
export class Clockid implements Data<"clockid"> {
  readonly __data = "clockid";

  static readonly size = 4;
  static readonly alignment = 4;

  constructor(
    readonly value: Value<Clockid>,
  ) {}

  static cast(
    mem: Memory,
    ptr: Pointer<Clockid>,
    offset: Offset = 0,
  ): Clockid {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), Clockid.size);
    return new Clockid(
      data.getUint32(0, true) as Value<Clockid>,
    );
  }

  store(mem: Memory, ptr: Pointer<Clockid>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), Clockid.size);
    data.setUint32(0, this.value, true);
  }

  // The clock measuring real time. Time value zero corresponds with
  // 1970-01-01T00:00:00Z.
  static readonly realtime = 0 as Value<Clockid>;

  get realtime(): boolean {
    return this.value === Clockid.realtime;
  }

  // The store-wide monotonic clock, which is defined as a clock measuring real
  // time, whose value cannot be adjusted and which cannot have negative clock
  // jumps. The epoch of this clock is undefined. The absolute time value of
  // this clock therefore has no meaning.
  static readonly monotonic = 1 as Value<Clockid>;

  get monotonic(): boolean {
    return this.value === Clockid.monotonic;
  }

  // The CPU-time clock associated with the current process.
  static readonly process_cputime_id = 2 as Value<Clockid>;

  get process_cputime_id(): boolean {
    return this.value === Clockid.process_cputime_id;
  }

  // The CPU-time clock associated with the current thread.
  static readonly thread_cputime_id = 3 as Value<Clockid>;

  get thread_cputime_id(): boolean {
    return this.value === Clockid.thread_cputime_id;
  }
}

// Error codes returned by functions. Not all of these error codes are returned
// by the functions provided by this API; some are used in higher-level library
// layers, and others are provided merely for alignment with POSIX.
export class Errno extends U16<"errno"> {
  readonly __data = "errno";

  static cast(
    mem: Memory,
    ptr: Pointer<Errno>,
    offset: Offset = 0,
  ): Errno {
    return new Errno(this.getValue(mem, ptr, offset) as Value<Errno>);
  }

  // No error occurred. System call completed successfully.
  static readonly success = 0 as Value<Errno>;

  // Argument list too long.
  static readonly toobig = 1 as Value<Errno>;

  // Permission denied.
  static readonly acces = 2 as Value<Errno>;

  // Address in use.
  static readonly addrinuse = 3 as Value<Errno>;

  // Address not available.
  static readonly addrnotavail = 4 as Value<Errno>;

  // Address family not supported.
  static readonly afnosupport = 5 as Value<Errno>;

  // Resource unavailable, or operation would block.
  static readonly again = 6 as Value<Errno>;

  // Connection already in progress.
  static readonly already = 7 as Value<Errno>;

  // Bad file descriptor.
  static readonly badf = 8 as Value<Errno>;

  // Bad message.
  static readonly badmsg = 9 as Value<Errno>;

  // Device or resource busy.
  static readonly busy = 10 as Value<Errno>;

  // Operation canceled.
  static readonly canceled = 11 as Value<Errno>;

  // No child processes.
  static readonly child = 12 as Value<Errno>;

  // Connection aborted.
  static readonly connaborted = 13 as Value<Errno>;

  // connrefused Connection refused.
  static readonly connrefused = 14 as Value<Errno>;

  // connreset Connection reset.
  static readonly connreset = 15 as Value<Errno>;

  // Resource deadlock would occur.
  static readonly deadlk = 16 as Value<Errno>;

  // Destination address required.
  static readonly destaddrreq = 17 as Value<Errno>;

  // Mathematics argument out of domain of function.
  static readonly dom = 18 as Value<Errno>;

  // Reserved.
  static readonly dquot = 19 as Value<Errno>;

  // File exists.
  static readonly exist = 20 as Value<Errno>;

  // Bad address.
  static readonly fault = 21 as Value<Errno>;

  // File too large.
  static readonly fbig = 22 as Value<Errno>;

  // Host is unreachable.
  static readonly hostunreach = 23 as Value<Errno>;

  // Identifier removed.
  static readonly idrm = 24 as Value<Errno>;

  // Illegal byte sequence.
  static readonly ilseq = 25 as Value<Errno>;

  // Operation in progress.
  static readonly inprogress = 26 as Value<Errno>;

  // Interrupted function.
  static readonly intr = 27 as Value<Errno>;

  // Invalid argument.
  static readonly inval = 28 as Value<Errno>;

  // I/O error.
  static readonly io = 29 as Value<Errno>;

  // Socket is connected.
  static readonly isconn = 30 as Value<Errno>;

  // Is a directory.
  static readonly isdir = 31 as Value<Errno>;

  // Too many levels of symbolic links.
  static readonly loop = 32 as Value<Errno>;

  // File descriptor value too large.
  static readonly mfile = 33 as Value<Errno>;

  // Too many links.
  static readonly mlink = 34 as Value<Errno>;

  // Message too large.
  static readonly msgsize = 35 as Value<Errno>;

  // Reserved.
  static readonly multihop = 36 as Value<Errno>;

  // Filename too long.
  static readonly nametoolong = 37 as Value<Errno>;

  // Network is down.
  static readonly netdown = 38 as Value<Errno>;

  // Connection aborted by network.
  static readonly netreset = 39 as Value<Errno>;

  // Network unreachable.
  static readonly netunreach = 40 as Value<Errno>;

  // Too many files open in system.
  static readonly nfile = 41 as Value<Errno>;

  // No buffer space available.
  static readonly nobufs = 42 as Value<Errno>;

  // No such device.
  static readonly nodev = 43 as Value<Errno>;

  // No such file or directory.
  static readonly noent = 44 as Value<Errno>;

  // Executable file format error.
  static readonly noexec = 45 as Value<Errno>;

  // No locks available.
  static readonly nolck = 46 as Value<Errno>;

  // Reserved.
  static readonly nolink = 47 as Value<Errno>;

  // Not enough space.
  static readonly nomem = 48 as Value<Errno>;

  // No message of the desired type.
  static readonly nomsg = 49 as Value<Errno>;

  // Protocol not available.
  static readonly noprotoopt = 50 as Value<Errno>;

  // No space left on device.
  static readonly nospc = 51 as Value<Errno>;

  // Function not supported.
  static readonly nosys = 52 as Value<Errno>;

  // The socket is not connected.
  static readonly notconn = 53 as Value<Errno>;

  // Not a directory or a symbolic link to a directory.
  static readonly notdir = 54 as Value<Errno>;

  // Directory not empty.
  static readonly notempty = 55 as Value<Errno>;

  // State not recoverable.
  static readonly Notrecoverable = 56 as Value<Errno>;

  // Not a socket.
  static readonly notsock = 57 as Value<Errno>;

  // Not supported, or operation not supported on socket.
  static readonly notsup = 58 as Value<Errno>;

  // Inappropriate I/O control operation.
  static readonly notty = 59 as Value<Errno>;

  // No such device or address.
  static readonly nxio = 60 as Value<Errno>;

  // Value too large to be stored in data type.
  static readonly overflow = 61 as Value<Errno>;

  // Previous owner died.
  static readonly ownerdead = 62 as Value<Errno>;

  // Operation not permitted.
  static readonly perm = 63 as Value<Errno>;

  // Broken pipe.
  static readonly pipe = 64 as Value<Errno>;

  // Protocol error.
  static readonly proto = 65 as Value<Errno>;

  // Protocol not supported.
  static readonly protonosupport = 66 as Value<Errno>;

  // Protocol wrong type for socket.
  static readonly prototypes = 67 as Value<Errno>;

  // Result too large.
  static readonly range = 68 as Value<Errno>;

  // Read-only file system.
  static readonly rofs = 69 as Value<Errno>;

  // Invalid seek.
  static readonly spipe = 70 as Value<Errno>;

  // No such process.
  static readonly srch = 71 as Value<Errno>;

  // Reserved.
  static readonly stale = 72 as Value<Errno>;

  // Connection timed out.
  static readonly timedout = 73 as Value<Errno>;

  // Text file busy.
  static readonly txtbsy = 74 as Value<Errno>;

  // Cross-device link.
  static readonly xdev = 75 as Value<Errno>;

  // Extension: Capabilities insufficient.
  static readonly notcapable = 76 as Value<Errno>;
}

// File descriptor rights, determining which actions may be performed.
export class Rights implements Data<"rights"> {
  readonly __data = "rights";

  static readonly size = 8;
  static readonly alignment = 8;

  constructor(
    private readonly flags: BigValue<Rights>,
  ) {}

  static zero(): Rights {
    return new Rights(0n as BigValue<Rights>);
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Rights>,
    offset: Offset = 0,
  ): Rights {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), Rights.size);
    return new Rights(data.getBigUint64(0, true) as BigValue<Rights>);
  }

  store(mem: Memory, ptr: Pointer<Rights>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), Rights.size);
    data.setBigUint64(0, this.flags, true);
  }

  // The right to invoke fd_datasync. If path_open is set, includes the right to
  // invoke path_open with fdflags::dsync.
  static readonly fd_datasync = (1n << 0n) as BigValue<Rights>;

  get fd_datasync(): boolean {
    return (this.flags & Rights.fd_datasync) > 0n;
  }

  // The right to invoke fd_read and sock_recv. If rights::fd_seek is set,
  // includes the right to invoke fd_pread.
  static readonly fd_read = (1n << 1n) as BigValue<Rights>;

  get fd_read(): boolean {
    return (this.flags & Rights.fd_read) > 0n;
  }

  // The right to invoke fd_seek. This flag implies rights::fd_tell.
  static readonly fd_seek = (1n << 2n) as BigValue<Rights>;

  get fd_seek(): boolean {
    return (this.flags & Rights.fd_seek) > 0n;
  }

  // The right to invoke fd_fdstat_set_flags.
  static readonly fd_fdstat_set_flags = (1n << 3n) as BigValue<Rights>;

  get fd_fdstat_set_flags(): boolean {
    return (this.flags & Rights.fd_fdstat_set_flags) > 0n;
  }

  // The right to invoke fd_sync. If path_open is set, includes the right to
  // invoke path_open with fdflags::rsync and fdflags::dsync.
  static readonly fd_sync = (1n << 4n) as BigValue<Rights>;

  get fd_sync(): boolean {
    return (this.flags & Rights.fd_sync) > 0n;
  }

  // The right to invoke fd_seek in such a way that the file offset remains
  // unaltered (i.e., whence::cur with offset zero), or to invoke fd_tell.
  static readonly fd_tell = (1n << 5n) as BigValue<Rights>;

  get fd_tell(): boolean {
    return (this.flags & Rights.fd_tell) > 0n;
  }

  // The right to invoke fd_write and sock_send. If rights::fd_seek is set,
  // includes the right to invoke fd_pwrite.
  static readonly fd_write = (1n << 6n) as BigValue<Rights>;

  get fd_write(): boolean {
    return (this.flags & Rights.fd_write) > 0n;
  }

  // The right to invoke fd_advise.
  static readonly fd_advise = (1n << 7n) as BigValue<Rights>;

  get fd_advise(): boolean {
    return (this.flags & Rights.fd_advise) > 0n;
  }

  // The right to invoke fd_allocate.
  static readonly fd_allocate = (1n << 8n) as BigValue<Rights>;

  get fd_allocate(): boolean {
    return (this.flags & Rights.fd_allocate) > 0n;
  }

  // The right to invoke path_create_directory.
  static readonly path_create_directory = (1n << 9n) as BigValue<Rights>;

  get path_create_directory(): boolean {
    return (this.flags & Rights.path_create_directory) > 0n;
  }

  // If path_open is set, the right to invoke path_open with oflags::creat.
  static readonly path_create_file = (1n << 10n) as BigValue<Rights>;

  get path_create_file(): boolean {
    return (this.flags & Rights.path_create_file) > 0n;
  }

  // The right to invoke path_link with the file descriptor as the source
  // directory.
  static readonly path_link_source = (1n << 11n) as BigValue<Rights>;

  get path_link_source(): boolean {
    return (this.flags & Rights.path_link_source) > 0n;
  }

  // The right to invoke path_link with the file descriptor as the target
  // directory.
  static readonly path_link_target = (1n << 12n) as BigValue<Rights>;

  get path_link_target(): boolean {
    return (this.flags & Rights.path_link_target) > 0n;
  }

  // The right to invoke path_open.
  static readonly path_open = (1n << 13n) as BigValue<Rights>;

  get path_open(): boolean {
    return (this.flags & Rights.path_open) > 0n;
  }

  // The right to invoke fd_readdir.
  static readonly fd_readdir = (1n << 14n) as BigValue<Rights>;
  get fd_readdir(): boolean {
    return (this.flags & Rights.fd_readdir) > 0n;
  }

  // The right to invoke path_readlink.
  static readonly path_readlink = (1n << 15n) as BigValue<Rights>;

  get path_readlink(): boolean {
    return (this.flags & Rights.path_readlink) > 0n;
  }

  // The right to invoke path_rename with the file descriptor as the source
  // directory.
  static readonly path_rename_source = (1n << 16n) as BigValue<Rights>;

  get path_rename_source(): boolean {
    return (this.flags & Rights.path_rename_source) > 0n;
  }

  // The right to invoke path_rename with the file descriptor as the target
  // directory.
  static readonly path_rename_target = (1n << 17n) as BigValue<Rights>;

  get path_rename_target(): boolean {
    return (this.flags & Rights.path_rename_target) > 0n;
  }

  // The right to invoke path_filestat_get.
  static readonly path_filestat_get = (1n << 18n) as BigValue<Rights>;

  get path_filestat_get(): boolean {
    return (this.flags & Rights.path_filestat_get) > 0n;
  }

  // The right to change a file's size. If path_open is set, includes the right
  // to invoke path_open with oflags::trunc. Note: there is no function named
  // path_filestat_set_size. This follows POSIX design, which only has ftruncate
  // and does not provide ftruncateat. While such function would be desirable
  // from the API design perspective, there are virtually no use cases for it
  // since no code written for POSIX systems would use it. Moreover,
  // implementing it would require multiple syscalls, leading to inferior
  // performance.
  static readonly path_filestat_set_size = (1n << 19n) as BigValue<Rights>;

  get path_filestat_set_size(): boolean {
    return (this.flags & Rights.path_filestat_set_size) > 0n;
  }

  // The right to invoke path_filestat_set_times.
  static readonly path_filestat_set_times = (1n << 20n) as BigValue<Rights>;
  get path_filestat_set_times(): boolean {
    return (this.flags & Rights.path_filestat_set_times) > 0n;
  }

  // The right to invoke fd_filestat_get.
  static readonly fd_filestat_get = (1n << 21n) as BigValue<Rights>;

  get fd_filestat_get(): boolean {
    return (this.flags & Rights.fd_filestat_get) > 0n;
  }

  // The right to invoke fd_filestat_set_size.
  static readonly fd_filestat_set_size = (1n << 22n) as BigValue<Rights>;

  get fd_filestat_set_size(): boolean {
    return (this.flags & Rights.fd_filestat_set_size) > 0n;
  }

  // The right to invoke fd_filestat_set_times.
  static readonly fd_filestat_set_times = (1n << 23n) as BigValue<Rights>;

  get fd_filestat_set_times(): boolean {
    return (this.flags & Rights.fd_filestat_set_times) > 0n;
  }

  // The right to invoke path_symlink.
  static readonly path_symlink = (1n << 24n) as BigValue<Rights>;

  get path_symlink(): boolean {
    return (this.flags & Rights.path_symlink) > 0n;
  }

  // The right to invoke path_remove_directory.
  static readonly path_remove_directory = (1n << 25n) as BigValue<Rights>;

  get path_remove_directory(): boolean {
    return (this.flags & Rights.path_remove_directory) > 0n;
  }

  // The right to invoke path_unlink_file.
  static readonly path_unlink_file = (1n << 26n) as BigValue<Rights>;

  get path_unlink_file(): boolean {
    return (this.flags & Rights.path_unlink_file) > 0n;
  }

  // If rights::fd_read is set, includes the right to invoke poll_oneoff to
  // subscribe to eventtype::fd_read. If rights::fd_write is set, includes the
  // right to invoke poll_oneoff to subscribe to eventtype::fd_write.
  static readonly poll_fd_readwrite = (1n << 27n) as BigValue<Rights>;

  get poll_fd_readwrite(): boolean {
    return (this.flags & Rights.poll_fd_readwrite) > 0n;
  }

  // The right to invoke sock_shutdown.
  static readonly sock_shutdown = (1n << 28n) as BigValue<Rights>;

  get sock_shutdown(): boolean {
    return (this.flags & Rights.sock_shutdown) > 0n;
  }

  // The right to invoke sock_accept.
  static readonly sock_accept = (1n << 29n) as BigValue<Rights>;

  get sock_accept(): boolean {
    return (this.flags & Rights.sock_accept) > 0n;
  }
}

// A file descriptor handle.
export class Fd implements Data<"fd"> {
  readonly __data = "fd";

  static readonly size = 4;
  static readonly alignment = 4;

  constructor(
    readonly value: Value<Fd>,
  ) {}

  static cast(
    mem: Memory,
    ptr: Pointer<Fd>,
    offset: Offset = 0,
  ): Fd {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), Fd.size);
    return new Fd(
      data.getUint32(0, true) as Value<Fd>,
    );
  }

  store(mem: Memory, ptr: Pointer<Fd>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset), Fd.size);
    data.setUint32(0, this.value, true);
  }

  static readonly stdin = 0 as Value<Fd>;
  static readonly stdout = 1 as Value<Fd>;
  static readonly stderr = 2 as Value<Fd>;
}

interface IovecParams {
  readonly buf: Pointer<U8<string>>;
  readonly buf_len: Size;
}

// A region of memory for scatter/gather reads.
export class Iovec implements Data<"iovec">, IovecParams {
  readonly __data = "iovec";

  static readonly size = 8;
  static readonly alignment = 4;

  // The address of the buffer to be filled.
  readonly buf: Pointer<U8<string>>;

  // The length of the buffer to be filled.
  readonly buf_len: Size;

  constructor({ buf, buf_len }: IovecParams) {
    this.buf = buf;
    this.buf_len = buf_len;
  }

  static cast(mem: Memory, ptr: Pointer<Iovec>, offset: Offset = 0): Iovec {
    return new Iovec({
      buf: Pointer.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Pointer<U8<string>>>,
        offset,
      ),
      buf_len: Size.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Size>,
        offset + 4,
      ),
    });
  }

  store(mem: Memory, ptr: Pointer<Iovec>, offset: Offset = 0) {
    Pointer.store(
      this.buf,
      mem,
      ptr as Pointer<Data<string>> as Pointer<Pointer<U8<string>>>,
      offset,
    );
    this.buf_len.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Size>,
      offset + 4,
    );
  }
}

export class IovecArray extends Iovec {}

interface CiovecParams {
  readonly buf: Pointer<U8<string>>;
  readonly buf_len: Size;
}

// A region of memory for scatter/gather writes.
export class Ciovec implements Data<"ciovec">, CiovecParams {
  readonly __data = "ciovec";

  static readonly size = 8;
  static readonly alignment = 4;

  // The address of the buffer to be written.
  readonly buf: Pointer<U8<string>>;

  // The length of the buffer to be written.
  readonly buf_len: Size;

  constructor({
    buf,
    buf_len,
  }: CiovecParams) {
    this.buf = buf;
    this.buf_len = buf_len;
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Ciovec>,
    offset: Offset = 0,
  ): Ciovec {
    return new Ciovec({
      buf: Pointer.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Pointer<U8<string>>>,
        offset,
      ),
      buf_len: Size.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Size>,
        offset + 4,
      ),
    });
  }

  store(mem: Memory, ptr: Pointer<Ciovec>, offset: Offset = 0) {
    Pointer.store(
      this.buf,
      mem,
      ptr as Pointer<Data<string>> as Pointer<Pointer<U8<string>>>,
      offset,
    );
    this.buf_len.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Size>,
      offset + 4,
    );
  }
}

export class CiovecArray extends Ciovec {}

// A reference to the offset of a directory entry.
//
// The value 0 signifies the start of the directory.
export class Dircookie extends U64<"dircookie"> {
  readonly __data = "dircookie";

  static cast(
    mem: Memory,
    ptr: Pointer<Dircookie>,
    offset: Offset = 0,
  ): Dircookie {
    return new Dircookie(
      Dircookie.getValue(mem, ptr, offset) as BigValue<Dircookie>,
    );
  }
}

// File serial number that is unique within its file system.
export class Inode extends U64<"inode"> {
  readonly __data = "inode";

  static cast(
    mem: Memory,
    ptr: Pointer<Inode>,
    offset: Offset = 0,
  ): Inode {
    return new Inode(
      Inode.getValue(mem, ptr, offset) as BigValue<Inode>,
    );
  }
}

// The type of a file descriptor or file.
export class Filetype extends U8<"filetype"> {
  readonly __data = "filetype";

  static cast(
    mem: Memory,
    ptr: Pointer<Filetype>,
    offset: Offset = 0,
  ): Filetype {
    return new Filetype(
      Filetype.getValue(mem, ptr, offset) as Value<Filetype>,
    );
  }

  // The type of the file descriptor or file is unknown or is different from any of the other types specified.
  static readonly unknown = 0 as Value<Filetype>;

  get unknown(): boolean {
    return this.value === Filetype.unknown;
  }

  // The file descriptor or file refers to a block device inode.
  static readonly block_device = 1 as Value<Filetype>;

  get block_device(): boolean {
    return this.value === Filetype.block_device;
  }

  // The file descriptor or file refers to a character device inode.
  static readonly character_device = 2 as Value<Filetype>;

  get character_device(): boolean {
    return this.value === Filetype.character_device;
  }

  // The file descriptor or file refers to a directory inode.
  static readonly directory = 3 as Value<Filetype>;

  get directory(): boolean {
    return this.value === Filetype.directory;
  }

  // The file descriptor or file refers to a regular file inode.
  static readonly regular_file = 4 as Value<Filetype>;

  get regular_file(): boolean {
    return this.value === Filetype.regular_file;
  }

  // The file descriptor or file refers to a datagram socket.
  static readonly socket_dgram = 5 as Value<Filetype>;

  get socket_dgram(): boolean {
    return this.value === Filetype.socket_dgram;
  }

  // The file descriptor or file refers to a byte-stream socket.
  static readonly socket_stream = 6 as Value<Filetype>;

  get socket_stream(): boolean {
    return this.value === Filetype.socket_stream;
  }

  // The file refers to a symbolic link inode.
  static readonly symbolic_link = 7 as Value<Filetype>;

  get symbolic_link(): boolean {
    return this.value === Filetype.symbolic_link;
  }
}

// File descriptor flags.
export class Fdflags extends U16<"fdflags"> {
  readonly __data = "fdflags";

  static zero(): Fdflags {
    return new Fdflags(0 as Value<Fdflags>);
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Fdflags>,
    offset: Offset = 0,
  ): Fdflags {
    return new Fdflags(
      this.getValue(mem, ptr, offset) as Value<Fdflags>,
    );
  }

  // Append mode: Data written to the file is always appended to the file's end.
  static readonly append = 1 << 0 as Value<Fdflags>;

  get append(): boolean {
    return (this.value & Fdflags.append) > 0;
  }

  // Write according to synchronized I/O data integrity completion. Only the
  // data stored in the file is synchronized.
  static readonly dsync = 1 << 1 as Value<Fdflags>;

  get dsync(): boolean {
    return (this.value & Fdflags.dsync) > 0;
  }

  // Non-blocking mode
  static readonly nonblock = 1 << 2 as Value<Fdflags>;

  get nonblock(): boolean {
    return (this.value & Fdflags.nonblock) > 0;
  }

  // Synchronized read I/O operations.
  static readonly rsync = 1 << 3 as Value<Fdflags>;

  get rsync(): boolean {
    return (this.value & Fdflags.rsync) > 0;
  }

  // Write according to synchronized I/O file integrity completion. In addition
  // to synchronizing the data stored in the file, the implementation may also
  // synchronously update the file's metadata.
  static readonly sync = 1 << 4 as Value<Fdflags>;

  get sync(): boolean {
    return (this.value & Fdflags.sync) > 0;
  }
}

interface FdstatParams {
  readonly fs_filetype: Filetype;
  readonly fs_flags: Fdflags;
  readonly fs_rights_base: Rights;
  readonly fs_rights_inheriting: Rights;
}

// File descriptor attributes.
export class Fdstat implements Data<"fdstat">, FdstatParams {
  readonly __data = "fdstat";

  static readonly size = 24;
  static readonly alignment = 8;

  // File type.
  readonly fs_filetype: Filetype;
  // File descriptor flags.
  readonly fs_flags: Fdflags;
  // Rights that apply to this file descriptor.
  readonly fs_rights_base: Rights;
  // Maximum set of rights that may be installed on new file descriptors that
  // are created through this file descriptor, e.g., through path_open.
  readonly fs_rights_inheriting: Rights;

  constructor({
    fs_filetype,
    fs_flags,
    fs_rights_base,
    fs_rights_inheriting,
  }: FdstatParams) {
    this.fs_filetype = fs_filetype;
    this.fs_flags = fs_flags;
    this.fs_rights_base = fs_rights_base;
    this.fs_rights_inheriting = fs_rights_inheriting;
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Fdstat>,
    offset: Offset = 0,
  ): Fdstat {
    return new Fdstat({
      fs_filetype: Filetype.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Filetype>,
        offset,
      ),
      fs_flags: Fdflags.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Fdflags>,
        offset + 2,
      ),
      fs_rights_base: Rights.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Rights>,
        offset + 8,
      ),
      fs_rights_inheriting: Rights.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Rights>,
        offset + 16,
      ),
    });
  }

  store(mem: Memory, ptr: Pointer<Fdstat>, offset: Offset = 0) {
    this.fs_filetype.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Filetype>,
      offset,
    );
    this.fs_flags.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Fdflags>,
      offset + 2,
    );
    this.fs_rights_base.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Rights>,
      offset + 8,
    );
    this.fs_rights_inheriting.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Rights>,
      offset + 16,
    );
  }
}

// Identifier for a device containing a file system. Can be used in combination
// with `inode` to uniquely identify a file or directory in the filesystem.
export class Device extends U64<"device"> {
  readonly __data = "device";

  static cast(
    mem: Memory,
    ptr: Pointer<Device>,
    offset: Offset = 0,
  ): Device {
    return new Device(
      Device.getValue(mem, ptr, offset) as BigValue<Device>,
    );
  }
}

// Flags determining the method of how paths are resolved.
export class Lookupflags extends U32<"lookupflags"> {
  readonly __data = "lookupflags";

  static cast(
    mem: Memory,
    ptr: Pointer<Lookupflags>,
    offset: Offset = 0,
  ): Lookupflags {
    return new Lookupflags(
      Lookupflags.getValue(mem, ptr, offset) as Value<Lookupflags>,
    );
  }

  // As long as the resolved path corresponds to a symbolic link, it is expanded.
  static readonly symlink_follow = 1 << 0 as Value<Lookupflags>;

  get symlink_follow(): boolean {
    return (this.value & Lookupflags.symlink_follow) > 0;
  }
}

// Exit code generated by a process when exiting.
export class Exitcode implements Data<"exitcode"> {
  readonly __data = "exitcode";

  static readonly size = 4;
  static readonly alignment = 4;

  constructor(
    readonly value: Value<Exitcode>,
  ) {}
}

// userdata: u64
//
// User-provided value that may be attached to objects that is retained when extracted from the implementation.
export class Userdata implements Data<"userdata"> {
  readonly __data = "userdata";

  static readonly size = 8;
  static readonly alignment = 8;

  constructor(
    readonly value: BigValue<Userdata>,
  ) {}

  static cast(
    mem: Memory,
    ptr: Pointer<Userdata>,
    offset: Offset = 0,
  ): Userdata {
    const data = new DataView(
      mem.buffer,
      addOffset(ptr, offset),
      Userdata.size,
    );
    return new Userdata(data.getBigUint64(0, true) as BigValue<Userdata>);
  }

  store(mem: Memory, ptr: Pointer<Userdata>, offset: Offset = 0) {
    const data = new DataView(
      mem.buffer,
      addOffset(ptr, offset),
      Userdata.size,
    );
    data.setBigUint64(0, this.value, true);
  }
}

// eventtype: Variant
//
// Type of a subscription to an event or its occurrence.
export class Eventtype implements Data<"eventtype"> {
  readonly __data = "eventtype";

  static readonly size = 1;
  static readonly alignment = 1;

  constructor(readonly value: Value<Eventtype>) {}

  static cast(
    mem: Memory,
    ptr: Pointer<Eventtype>,
    offset: Offset = 0,
  ): Eventtype {
    const data = new DataView(
      mem.buffer,
      addOffset(ptr, offset),
      Eventtype.size,
    );
    return new Eventtype(data.getUint8(0) as Value<Eventtype>);
  }

  store(mem: Memory, ptr: Pointer<Eventtype>, offset: Offset = 0) {
    const data = new DataView(
      mem.buffer,
      addOffset(ptr, offset),
      Eventtype.size,
    );
    data.setUint8(0, this.value);
  }

  // The time value of clock subscription_clock::id has reached timestamp
  // subscription_clock::timeout.
  static readonly clock = 0 as Value<Eventtype>;

  get clock(): boolean {
    return this.value === Eventtype.clock;
  }

  // File descriptor subscription_fd_readwrite::file_descriptor has data
  // available for reading. This event always triggers for regular files.
  static readonly fd_read = 1 as Value<Eventtype>;

  get fd_read(): boolean {
    return this.value === Eventtype.fd_read;
  }

  // File descriptor subscription_fd_readwrite::file_descriptor has capacity
  // available for writing. This event always triggers for regular files.
  static readonly fd_write = 2 as Value<Eventtype>;

  get fd_write(): boolean {
    return this.value === Eventtype.fd_write;
  }
}

// The state of the file descriptor subscribed to with eventtype::fd_read or
// eventtype::fd_write.
export class Eventrwflags extends U16<"eventrwflags"> {
  readonly __data = "eventrwflags";

  static zero(): Eventrwflags {
    return new Eventrwflags(0 as Value<Eventrwflags>);
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Eventrwflags>,
    offset: Offset = 0,
  ): Eventrwflags {
    return new Eventrwflags(
      this.getValue(mem, ptr, offset) as Value<Eventrwflags>,
    );
  }

  // peer of this socket has closed or disconnected.
  static readonly fd_readwrite_hangup = 1 as Value<Eventrwflags>;

  get fd_readwrite_hangup(): boolean {
    return (this.value & Eventrwflags.fd_readwrite_hangup) > 0;
  }
}

interface EventFdReadwriteParams {
  readonly nbytes: Filesize;
  readonly flags: Eventrwflags;
}

// event_fd_readwrite: Record
//
// The contents of an event when type is eventtype::fd_read or eventtype::fd_write.
export class EventFdReadwrite
  implements Data<"event_fd_readwrite">, EventFdReadwriteParams {
  readonly __data = "event_fd_readwrite";

  static readonly size = 16;
  static readonly alignment = 8;

  // The number of bytes available for reading or writing.
  readonly nbytes: Filesize;

  // The state of the file descriptor.
  readonly flags: Eventrwflags;

  constructor({ nbytes, flags }: EventFdReadwriteParams) {
    this.nbytes = nbytes;
    this.flags = flags;
  }

  static zero(): EventFdReadwrite {
    return new EventFdReadwrite({
      nbytes: Filesize.zero(),
      flags: Eventrwflags.zero(),
    });
  }

  static cast(
    mem: Memory,
    ptr: Pointer<EventFdReadwrite>,
    offset: Offset = 0,
  ): EventFdReadwrite {
    return new EventFdReadwrite({
      nbytes: Filesize.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Filesize>,
        offset,
      ),
      flags: Eventrwflags.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Eventrwflags>,
        offset + 8,
      ),
    });
  }

  store(
    mem: Memory,
    ptr: Pointer<EventFdReadwrite>,
    offset: Offset = 0,
  ) {
    this.nbytes.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Filesize>,
      offset,
    );
    this.flags.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Eventrwflags>,
      offset + 8,
    );
  }
}

// Flags determining how to interpret the timestamp provided in
// subscription_clock::timeout.
export class Subclockflags extends U16<"subclockflags"> {
  readonly __data = "subclockflags";

  static zero(): Subclockflags {
    return new Subclockflags(0 as Value<Subclockflags>);
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Subclockflags>,
    offset: Offset = 0,
  ): Subclockflags {
    return new Subclockflags(
      this.getValue(mem, ptr, offset) as Value<Subclockflags>,
    );
  }

  // set, treat the timestamp provided in subscription_clock::timeout as an
  // absolute timestamp of clock subscription_clock::id. If clear, treat the
  // timestamp provided in subscription_clock::timeout relative to the current
  // time value of clock subscription_clock::id.
  static readonly subscription_clock_abstime = 1 << 0 as Value<Subclockflags>;

  get subscription_clock_abstime(): boolean {
    return (this.value & Subclockflags.subscription_clock_abstime) > 0;
  }
}

interface SubscriptionClockParams {
  readonly id: Clockid;
  readonly timeout: Timestamp;
  readonly precision: Timestamp;
  readonly flags: Subclockflags;
}

// The contents of a subscription when type is eventtype::clock.
export class SubscriptionClock
  implements Data<"subscription_clock">, SubscriptionClockParams {
  readonly __data = "subscription_clock";

  static readonly size = 32;
  static readonly alignment = 8;

  // The clock against which to compare the timestamp.
  readonly id: Clockid;

  // The absolute or relative timestamp.
  readonly timeout: Timestamp;

  // The amount of time that the implementation may wait additionally to
  // coalesce with other events.
  readonly precision: Timestamp;

  // Flags specifying whether the timeout is absolute or relative.
  readonly flags: Subclockflags;

  constructor({
    id,
    timeout,
    precision,
    flags,
  }: SubscriptionClockParams) {
    this.id = id;
    this.timeout = timeout;
    this.precision = precision;
    this.flags = flags;
  }

  static cast(
    mem: Memory,
    ptr: Pointer<SubscriptionClock>,
    offset: Offset = 0,
  ): SubscriptionClock {
    return new SubscriptionClock({
      id: Clockid.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Clockid>,
        offset,
      ),
      timeout: Timestamp.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Timestamp>,
        offset + 8,
      ),
      precision: Timestamp.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Timestamp>,
        offset + 16,
      ),
      flags: Subclockflags.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Subclockflags>,
        offset + 24,
      ),
    });
  }

  store(
    mem: Memory,
    ptr: Pointer<SubscriptionClock>,
    offset: Offset = 0,
  ) {
    this.id.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Clockid>,
      offset,
    );
    this.timeout.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Timestamp>,
      offset + 8,
    );
    this.precision.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Timestamp>,
      offset + 16,
    );
    this.flags.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Subclockflags>,
      offset + 24,
    );
  }
}

interface SubscriptionFdReadwriteParams {
  readonly fd: Fd;
}

// The contents of a subscription when type is type is eventtype::fd_read or
// eventtype::fd_write.
export class SubscriptionFdReadwrite
  implements Data<"subscription_fd_readwrite">, SubscriptionFdReadwriteParams {
  readonly __data = "subscription_fd_readwrite";

  static readonly size = 4;
  static readonly alignment = 4;

  // The file descriptor on which to wait for it to become ready for reading
  // or writing.
  readonly fd: Fd;

  constructor({
    fd,
  }: SubscriptionFdReadwriteParams) {
    this.fd = fd;
  }

  static cast(
    mem: Memory,
    ptr: Pointer<SubscriptionFdReadwrite>,
    offset: Offset = 0,
  ): SubscriptionFdReadwrite {
    return new SubscriptionFdReadwrite({
      fd: Fd.cast(mem, ptr as Pointer<Data<string>> as Pointer<Fd>, offset),
    });
  }

  store(
    mem: Memory,
    ptr: Pointer<SubscriptionFdReadwrite>,
    offset: Offset = 0,
  ) {
    this.fd.store(mem, ptr as Pointer<Data<string>> as Pointer<Fd>, offset);
  }
}

interface SubscriptionUParams {
  readonly type: Eventtype;
  readonly content: SubscriptionClock | SubscriptionFdReadwrite;
}

// The contents of a subscription.
export class SubscriptionU
  implements Data<"subscription_u">, SubscriptionUParams {
  readonly __data = "subscription_u";

  static readonly size = 40;
  static readonly alignment = 8;

  // Variant cases
  // - clock: subscription_clock
  // - fd_read: subscription_fd_readwrite
  // - fd_write: subscription_fd_readwrite
  readonly type: Eventtype;
  readonly content: SubscriptionClock | SubscriptionFdReadwrite;

  constructor({
    type,
    content,
  }: SubscriptionUParams) {
    this.type = type;
    this.content = content;
  }

  static cast(
    mem: Memory,
    ptr: Pointer<SubscriptionU>,
    offset: Offset = 0,
  ): SubscriptionU {
    const type = Eventtype.cast(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Eventtype>,
      offset,
    );
    const content = type.clock
      ? SubscriptionClock.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<SubscriptionClock>,
        offset + 8,
      )
      : SubscriptionFdReadwrite.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<SubscriptionFdReadwrite>,
        offset + 8,
      );
    return new SubscriptionU({ type, content });
  }

  store(
    mem: Memory,
    ptr: Pointer<SubscriptionU>,
    offset: Offset = 0,
  ) {
    this.type.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Eventtype>,
      offset,
    );

    if (this.type.clock) {
      (this.content as SubscriptionClock).store(
        mem,
        ptr as Pointer<Data<string>> as Pointer<SubscriptionClock>,
        offset + 8,
      );
    } else {
      (this.content as SubscriptionFdReadwrite).store(
        mem,
        ptr as Pointer<Data<string>> as Pointer<SubscriptionFdReadwrite>,
        offset + 8,
      );
    }
  }
}

interface SubscriptionParams {
  readonly userdata: Userdata;
  readonly u: SubscriptionU;
}

// Subscription to an event.
export class Subscription implements Data<"subscription">, SubscriptionParams {
  readonly __data = "subscription";

  static readonly size = 48;
  static readonly alignment = 8;

  // User-provided value that is attached to the subscription in the
  // implementation and returned through event::userdata.
  readonly userdata: Userdata;

  // The type of the event to which to subscribe, and its contents
  readonly u: SubscriptionU;

  constructor({
    userdata,
    u,
  }: SubscriptionParams) {
    this.userdata = userdata;
    this.u = u;
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Subscription>,
    offset: Offset = 0,
  ): Subscription {
    return new Subscription({
      userdata: Userdata.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Userdata>,
        offset,
      ),
      u: SubscriptionU.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<SubscriptionU>,
        offset + 8,
      ),
    });
  }

  store(
    mem: Memory,
    ptr: Pointer<SubscriptionClock>,
    offset: Offset = 0,
  ) {
    this.userdata.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Userdata>,
      offset,
    );
    this.u.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<SubscriptionU>,
      offset + 8,
    );
  }
}

interface EventParams {
  readonly userdata: Userdata;
  readonly error: Errno;
  readonly type: Eventtype;
  readonly fd_readwrite: EventFdReadwrite;
}

// event: Record
//
// An event that occurred.
export class Event implements Data<"event">, EventParams {
  readonly __data = "event";

  static readonly size = 32;
  static readonly alignment = 8;

  // User-provided value that got attached to subscription::userdata.
  readonly userdata: Userdata;

  // If non-zero, an error that occurred while processing the subscription
  // request.
  readonly error: Errno;

  // The type of event that occured
  readonly type: Eventtype;

  // The contents of the event, if it is an eventtype::fd_read or
  // eventtype::fd_write. eventtype::clock events ignore this field.
  readonly fd_readwrite: EventFdReadwrite;

  constructor({
    userdata,
    error,
    type,
    fd_readwrite,
  }: EventParams) {
    this.userdata = userdata;
    this.error = error;
    this.type = type;
    this.fd_readwrite = fd_readwrite;
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Event>,
    offset: Offset = 0,
  ): Event {
    return new Event({
      userdata: Userdata.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Userdata>,
        offset,
      ),
      error: Errno.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Errno>,
        offset + 8,
      ),
      type: Eventtype.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Eventtype>,
        offset + 10,
      ),
      fd_readwrite: EventFdReadwrite.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<EventFdReadwrite>,
        offset + 16,
      ),
    });
  }

  store(mem: Memory, ptr: Pointer<Event>, offset: Offset = 0) {
    this.userdata.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Userdata>,
      offset,
    );
    this.error.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Errno>,
      offset + 8,
    );
    this.type.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Eventtype>,
      offset + 10,
    );
    this.fd_readwrite.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<EventFdReadwrite>,
      offset + 16,
    );
  }
}

// Open flags used by `path_open`.
export class Oflags extends U16<"oflags"> {
  readonly __data = "oflags";

  static cast(mem: Memory, ptr: Pointer<Oflags>, offset: Offset = 0): Oflags {
    return new Oflags(
      this.getValue(mem, ptr, offset) as Value<Oflags>,
    );
  }

  // Create file if it does not exist.
  static creat = 1 << 0 as Value<Oflags>;

  get creat(): boolean {
    return (this.value & Oflags.creat) > 0;
  }

  // Fail if not a directory.
  static directory = 1 << 1 as Value<Oflags>;

  get directory(): boolean {
    return (this.value & Oflags.directory) > 0;
  }

  // Fail if file already exists.
  static excl = 1 << 2 as Value<Oflags>;

  get excl(): boolean {
    return (this.value & Oflags.excl) > 0;
  }

  // Truncate file to size 0.
  static trunc = 1 << 3 as Value<Oflags>;

  get trunc(): boolean {
    return (this.value & Oflags.trunc) > 0;
  }
}

// Number of hard links to an inode.
export class Linkcount extends U64<"linkcount"> {
  readonly __data = "linkcount";

  static zero(): Linkcount {
    return new Linkcount(0n as BigValue<Linkcount>);
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Linkcount>,
    offset: Offset = 0,
  ): Linkcount {
    return new Linkcount(
      Linkcount.getValue(mem, ptr, offset) as BigValue<Linkcount>,
    );
  }
}

interface FilestatParams {
  readonly dev: Device;
  readonly ino: Inode;
  readonly filetype: Filetype;
  readonly nlink: Linkcount;
  readonly size: Filesize;
  readonly atim: Timestamp;
  readonly mtim: Timestamp;
  readonly ctim: Timestamp;
}

// File attributes.
export class Filestat implements Data<"filestat">, FilestatParams {
  readonly __data = "filestat";

  static readonly size = 64;
  static readonly alignment = 8;

  // Device ID of device containing the file.
  readonly dev: Device;

  // File serial number.
  readonly ino: Inode;

  // File type.
  readonly filetype: Filetype;

  // Number of hard links to the file.
  readonly nlink: Linkcount;

  // For regular files, the file size in bytes. For symbolic links, the length
  // in bytes of the pathname contained in the symbolic link.
  readonly size: Filesize;

  // Last data access timestamp.
  readonly atim: Timestamp;

  // Last data modification timestamp.
  readonly mtim: Timestamp;

  // Last file status change timestamp.
  readonly ctim: Timestamp;

  constructor({
    dev,
    ino,
    filetype,
    nlink,
    size,
    atim,
    mtim,
    ctim,
  }: FilestatParams) {
    this.dev = dev;
    this.ino = ino;
    this.filetype = filetype;
    this.nlink = nlink;
    this.size = size;
    this.atim = atim;
    this.mtim = mtim;
    this.ctim = ctim;
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Filestat>,
    offset: Offset = 0,
  ): Filestat {
    return new Filestat({
      dev: Device.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Device>,
        offset,
      ),
      ino: Inode.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Inode>,
        offset + 8,
      ),
      filetype: Filetype.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Filetype>,
        offset + 16,
      ),
      nlink: Linkcount.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Linkcount>,
        offset + 24,
      ),
      size: Filesize.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Filesize>,
        offset + 32,
      ),
      atim: Timestamp.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Timestamp>,
        offset + 40,
      ),
      mtim: Timestamp.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Timestamp>,
        offset + 48,
      ),
      ctim: Timestamp.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Timestamp>,
        offset + 56,
      ),
    });
  }

  store(mem: Memory, ptr: Pointer<Filestat>, offset: Offset = 0) {
    this.dev.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Device>,
      offset,
    );
    this.ino.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Inode>,
      offset + 8,
    );
    this.filetype.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Filetype>,
      offset + 16,
    );
    this.nlink.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Linkcount>,
      offset + 24,
    );
    this.size.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Filesize>,
      offset + 32,
    );
    this.atim.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Timestamp>,
      offset + 40,
    );
    this.mtim.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Timestamp>,
      offset + 48,
    );
    this.ctim.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Timestamp>,
      offset + 56,
    );
  }
}

export class Preopentype implements Data<"preopentype"> {
  readonly __data = "preopentype";

  static readonly size = 1;
  static readonly alignment = 1;

  constructor(
    private readonly value: Value<Preopentype>,
  ) {}

  static cast(
    mem: Memory,
    ptr: Pointer<Preopentype>,
    offset: Offset = 0,
  ): Preopentype {
    const data = new DataView(
      mem.buffer,
      addOffset(ptr, offset),
      Preopentype.size,
    );
    return new Preopentype(data.getUint8(0) as Value<Preopentype>);
  }

  store(
    mem: Memory,
    ptr: Pointer<Preopentype>,
    offset: Offset = 0,
  ) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    data.setUint8(0, this.value);
  }

  // A pre-opened directory.
  static readonly dir = 0 as Value<Preopentype>;

  dir(): boolean {
    return this.value === Preopentype.dir;
  }
}

interface PrestatDirParams {
  readonly pr_name_len: Size;
}

// The contents of a $prestat when type is `preopentype::dir`.
export class PrestatDir implements Data<"prestat_dir">, PrestatDirParams {
  readonly __data = "prestat_dir";

  static readonly size = 4;
  static readonly alignment = 4;

  // The length of the directory name for use with `fd_prestat_dir_name`.
  readonly pr_name_len: Size;

  constructor({
    pr_name_len,
  }: PrestatDirParams) {
    this.pr_name_len = pr_name_len;
  }

  static cast(
    mem: Memory,
    ptr: Pointer<PrestatDir>,
    offset: Offset = 0,
  ): PrestatDir {
    return new PrestatDir({
      pr_name_len: Size.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Size>,
        offset,
      ),
    });
  }

  store(mem: Memory, ptr: Pointer<PrestatDir>, offset: Offset = 0) {
    this.pr_name_len.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Size>,
      offset,
    );
  }
}

interface PrestatParams {
  readonly type: Preopentype;
  readonly content: PrestatDir;
}

// Information about a pre-opened capability.
export class Prestat implements Data<"prestat">, PrestatParams {
  readonly __data = "prestat";

  static readonly size = 8;
  static readonly alignment = 4;

  // Variant cases
  // - dir: prestat_dir
  readonly type: Preopentype;
  readonly content: PrestatDir;

  constructor({
    type,
    content,
  }: PrestatParams) {
    this.type = type;
    this.content = content;
  }

  static cast(
    mem: Memory,
    ptr: Pointer<Prestat>,
    offset: Offset = 0,
  ): Prestat {
    return new Prestat({
      type: Preopentype.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<Preopentype>,
        offset,
      ),
      content: PrestatDir.cast(
        mem,
        ptr as Pointer<Data<string>> as Pointer<PrestatDir>,
        offset + 4,
      ),
    });
  }

  store(mem: Memory, ptr: Pointer<Prestat>, offset: Offset = 0) {
    this.type.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<Preopentype>,
      offset,
    );
    this.content.store(
      mem,
      ptr as Pointer<Data<string>> as Pointer<PrestatDir>,
      offset + 4,
    );
  }
}
