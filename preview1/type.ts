export interface Data<T> {
  readonly __data: T;
}

interface List<T> extends Data<T> {
  readonly __data: T;
}

// Pointer
export type Pointer<T extends Data<string>> = number & { __pointer: T } & {
  __data: string;
};

export const Pointer = <T extends Data<string>>(p: number): Pointer<T> =>
  p as Pointer<T>;

type Offset = number;

const addOffset = <T extends Data<string>>(
  ptr: Pointer<T>,
  offset: Offset,
): Pointer<T> => Pointer(ptr + offset);

// Value
export type Value<T extends Data<string>> = number & { __value: T };

export const Value = <T extends Data<string>>(v: number): Value<T> =>
  v as Value<T>;

// BigValue
export type BigValue<T extends Data<string>> = bigint & { __bigValue: T };

export const BigValue = <T extends Data<string>>(v: bigint): BigValue<T> =>
  v as BigValue<T>;

// U8
export class U8 implements Data<"u8"> {
  readonly __data = "u8";

  static readonly size = 1;
  static readonly alignment = 1;

  constructor(
    readonly value: Value<U8>,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<U8>,
    offset: Offset = 0,
  ): U8 {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    return new U8(Value(data.getUint8(0)));
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<U8>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    data.setUint8(0, this.value);
  }
}

// Size
export class Size implements Data<"size"> {
  readonly __data = "size";

  static readonly size = 4;
  static readonly alignment = 4;

  constructor(
    readonly value: Value<Size>,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Size>,
    offset: Offset = 0,
  ): Size {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    return new Size(Value(data.getUint32(0, true)));
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<Size>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    data.setUint32(0, this.value, true);
  }
}

// Non-negative file size or length of a region within a file.
export class Filesize implements Data<"filesize"> {
  readonly __data = "filesize";

  static readonly size = 8;
  static readonly alignment = 8;

  constructor(
    readonly value: BigValue<Filesize>,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Filesize>,
    offset: Offset = 0,
  ): Filesize {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    return new Filesize(
      BigValue(data.getBigUint64(0, true)),
    );
  }
}

// Timestamp in nanoseconds.
export class Timestamp implements Data<"timestamp"> {
  readonly __data = "timestamp";

  static readonly size = 8;
  static readonly alignment = 8;

  constructor(
    readonly value: BigValue<Timestamp>,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Timestamp>,
    offset: Offset = 0,
  ): Timestamp {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    return new Timestamp(BigValue(data.getBigUint64(0, true)));
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<Timestamp>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
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

  // The clock measuring real time. Time value zero corresponds with
  // 1970-01-01T00:00:00Z.
  static readonly realtime: Value<Clockid> = Value(0);

  // The store-wide monotonic clock, which is defined as a clock measuring real
  // time, whose value cannot be adjusted and which cannot have negative clock
  // jumps. The epoch of this clock is undefined. The absolute time value of
  // this clock therefore has no meaning.
  static readonly monotonic: Value<Clockid> = Value(1);

  // The CPU-time clock associated with the current process.
  static readonly process_cputime_id: Value<Clockid> = Value(2);

  // The CPU-time clock associated with the current thread.
  static readonly thread_cputime_id: Value<Clockid> = Value(3);
}

// Error codes returned by functions. Not all of these error codes are returned
// by the functions provided by this API; some are used in higher-level library
// layers, and others are provided merely for alignment with POSIX.
export class Errno implements Data<"errno"> {
  readonly __data = "errno";

  static readonly size = 2;
  static readonly alignment = 2;

  constructor(
    readonly value: Value<Errno>,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Errno>,
    offset: Offset = 0,
  ): Errno {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    return new Errno(data.getUint16(0, true) as Value<Errno>);
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

  static no(): Rights {
    return new Rights(BigValue(0n));
  }

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Rights>,
    offset: Offset = 0,
  ): Rights {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    return new Rights(BigValue(data.getBigUint64(0, true)));
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<Rights>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    data.setBigUint64(0, this.flags, true);
  }

  // The right to invoke fd_datasync. If path_open is set, includes the right to
  // invoke path_open with fdflags::dsync.
  static readonly fd_datasync: BigValue<Rights> = BigValue(1n << 0n);

  get fd_datasync(): boolean {
    return (this.flags & Rights.fd_datasync) > 0n;
  }

  // The right to invoke fd_read and sock_recv. If rights::fd_seek is set,
  // includes the right to invoke fd_pread.
  static readonly fd_read: BigValue<Rights> = BigValue(1n << 1n);

  get fd_read(): boolean {
    return (this.flags & Rights.fd_read) > 0n;
  }

  // The right to invoke fd_seek. This flag implies rights::fd_tell.
  static readonly fd_seek: BigValue<Rights> = BigValue(1n << 2n);

  get fd_seek(): boolean {
    return (this.flags & Rights.fd_seek) > 0n;
  }

  // The right to invoke fd_fdstat_set_flags.
  static readonly fd_fdstat_set_flags: BigValue<Rights> = BigValue(1n << 3n);

  get fd_fdstat_set_flags(): boolean {
    return (this.flags & Rights.fd_fdstat_set_flags) > 0n;
  }

  // The right to invoke fd_sync. If path_open is set, includes the right to
  // invoke path_open with fdflags::rsync and fdflags::dsync.
  static readonly fd_sync: BigValue<Rights> = BigValue(1n << 4n);

  get fd_sync(): boolean {
    return (this.flags & Rights.fd_sync) > 0n;
  }

  // The right to invoke fd_seek in such a way that the file offset remains
  // unaltered (i.e., whence::cur with offset zero), or to invoke fd_tell.
  static readonly fd_tell: BigValue<Rights> = BigValue(1n << 5n);

  get fd_tell(): boolean {
    return (this.flags & Rights.fd_tell) > 0n;
  }

  // The right to invoke fd_write and sock_send. If rights::fd_seek is set,
  // includes the right to invoke fd_pwrite.
  static readonly fd_write: BigValue<Rights> = BigValue(1n << 6n);

  get fd_write(): boolean {
    return (this.flags & Rights.fd_write) > 0n;
  }

  // The right to invoke fd_advise.
  static readonly fd_advise: BigValue<Rights> = BigValue(1n << 7n);

  get fd_advise(): boolean {
    return (this.flags & Rights.fd_advise) > 0n;
  }

  // The right to invoke fd_allocate.
  static readonly fd_allocate: BigValue<Rights> = BigValue(1n << 8n);

  get fd_allocate(): boolean {
    return (this.flags & Rights.fd_allocate) > 0n;
  }

  // The right to invoke path_create_directory.
  static readonly path_create_directory: BigValue<Rights> = BigValue(1n << 9n);

  get path_create_directory(): boolean {
    return (this.flags & Rights.path_create_directory) > 0n;
  }

  // If path_open is set, the right to invoke path_open with oflags::creat.
  static readonly path_create_file: BigValue<Rights> = BigValue(1n << 10n);

  get path_create_file(): boolean {
    return (this.flags & Rights.path_create_file) > 0n;
  }

  // The right to invoke path_link with the file descriptor as the source
  // directory.
  static readonly path_link_source: BigValue<Rights> = BigValue(1n << 11n);

  get path_link_source(): boolean {
    return (this.flags & Rights.path_link_source) > 0n;
  }

  // The right to invoke path_link with the file descriptor as the target
  // directory.
  static readonly path_link_target: BigValue<Rights> = BigValue(1n << 12n);

  get path_link_target(): boolean {
    return (this.flags & Rights.path_link_target) > 0n;
  }

  // The right to invoke path_open.
  static readonly path_open: BigValue<Rights> = BigValue(1n << 13n);

  get path_open(): boolean {
    return (this.flags & Rights.path_open) > 0n;
  }

  // The right to invoke fd_readdir.
  static readonly fd_readdir: BigValue<Rights> = BigValue(1n << 14n);
  get fd_readdir(): boolean {
    return (this.flags & Rights.fd_readdir) > 0n;
  }

  // The right to invoke path_readlink.
  static readonly path_readlink: BigValue<Rights> = BigValue(1n << 15n);

  get path_readlink(): boolean {
    return (this.flags & Rights.path_readlink) > 0n;
  }

  // The right to invoke path_rename with the file descriptor as the source
  // directory.
  static readonly path_rename_source: BigValue<Rights> = BigValue(1n << 16n);

  get path_rename_source(): boolean {
    return (this.flags & Rights.path_rename_source) > 0n;
  }

  // The right to invoke path_rename with the file descriptor as the target
  // directory.
  static readonly path_rename_target: BigValue<Rights> = BigValue(1n << 17n);

  get path_rename_target(): boolean {
    return (this.flags & Rights.path_rename_target) > 0n;
  }

  // The right to invoke path_filestat_get.
  static readonly path_filestat_get: BigValue<Rights> = BigValue(1n << 18n);

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
  static readonly path_filestat_set_size: BigValue<Rights> = BigValue(
    1n << 19n,
  );

  get path_filestat_set_size(): boolean {
    return (this.flags & Rights.path_filestat_set_size) > 0n;
  }

  // The right to invoke path_filestat_set_times.
  static readonly path_filestat_set_times: BigValue<Rights> = BigValue(
    1n << 20n,
  );
  get path_filestat_set_times(): boolean {
    return (this.flags & Rights.path_filestat_set_times) > 0n;
  }

  // The right to invoke fd_filestat_get.
  static readonly fd_filestat_get: BigValue<Rights> = BigValue(1n << 21n);

  get fd_filestat_get(): boolean {
    return (this.flags & Rights.fd_filestat_get) > 0n;
  }

  // The right to invoke fd_filestat_set_size.
  static readonly fd_filestat_set_size: BigValue<Rights> = BigValue(1n << 22n);

  get fd_filestat_set_size(): boolean {
    return (this.flags & Rights.fd_filestat_set_size) > 0n;
  }

  // The right to invoke fd_filestat_set_times.
  static readonly fd_filestat_set_times: BigValue<Rights> = BigValue(1n << 23n);

  get fd_filestat_set_times(): boolean {
    return (this.flags & Rights.fd_filestat_set_times) > 0n;
  }

  // The right to invoke path_symlink.
  static readonly path_symlink: BigValue<Rights> = BigValue(1n << 24n);

  get path_symlink(): boolean {
    return (this.flags & Rights.path_symlink) > 0n;
  }

  // The right to invoke path_remove_directory.
  static readonly path_remove_directory: BigValue<Rights> = BigValue(1n << 25n);

  get path_remove_directory(): boolean {
    return (this.flags & Rights.path_remove_directory) > 0n;
  }

  // The right to invoke path_unlink_file.
  static readonly path_unlink_file: BigValue<Rights> = BigValue(1n << 26n);

  get path_unlink_file(): boolean {
    return (this.flags & Rights.path_unlink_file) > 0n;
  }

  // If rights::fd_read is set, includes the right to invoke poll_oneoff to
  // subscribe to eventtype::fd_read. If rights::fd_write is set, includes the
  // right to invoke poll_oneoff to subscribe to eventtype::fd_write.
  static readonly poll_fd_readwrite: BigValue<Rights> = BigValue(1n << 27n);

  get poll_fd_readwrite(): boolean {
    return (this.flags & Rights.poll_fd_readwrite) > 0n;
  }

  // The right to invoke sock_shutdown.
  static readonly sock_shutdown: BigValue<Rights> = BigValue(1n << 28n);

  get sock_shutdown(): boolean {
    return (this.flags & Rights.sock_shutdown) > 0n;
  }

  // The right to invoke sock_accept.
  static readonly sock_accept: BigValue<Rights> = BigValue(1n << 29n);

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

  static readonly stdin: Value<Fd> = Value(0);
  static readonly stdout: Value<Fd> = Value(1);
  static readonly stderr: Value<Fd> = Value(2);
}

type InitIovec = {
  readonly buf: Pointer<U8>;
  readonly len: Size;
};

// A region of memory for scatter/gather reads.
export class Iovec implements Data<"iovec"> {
  readonly __data = "iovec";

  static readonly size = 8;
  static readonly alignment = 4;

  readonly buf: Pointer<U8>;
  readonly len: Size;

  constructor({ buf, len }: InitIovec) {
    this.buf = buf;
    this.len = len;
  }
}

export class IovecArray extends Iovec {}

type InitCiovec = {
  readonly buf: Pointer<U8>;
  readonly len: Size;
};

// A region of memory for scatter/gather writes.
export class Ciovec implements Data<"ciovec"> {
  readonly __data = "ciovec";

  static readonly size = 8;
  static readonly alignment = 4;

  readonly buf: Pointer<U8>;
  readonly len: Size;

  constructor({
    buf,
    len,
  }: InitCiovec) {
    this.buf = buf;
    this.len = len;
  }

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Ciovec>,
    offset: Offset = 0,
  ): Ciovec {
    const data = new DataView(mem.buffer);
    return new Ciovec({
      buf: Pointer(data.getUint32(addOffset(ptr, offset), true)),
      len: Size.cast(mem, Pointer(ptr), offset + 4),
    });
  }
}

export class CiovecArray extends Ciovec {}

// The type of a file descriptor or file.
export class Filetype implements Data<"filetype"> {
  readonly __data = "filetype";

  static readonly size = 1;
  static readonly alignment = 1;

  constructor(
    private readonly value: Value<Filetype>,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Filetype>,
    offset: Offset = 0,
  ): Filetype {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    return new Filetype(
      Value(data.getUint8(0)),
    );
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<Filetype>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    data.setUint8(0, this.value);
  }

  // The type of the file descriptor or file is unknown or is different from any of the other types specified.
  static readonly unknown: Value<Filetype> = Value(0);

  // The file descriptor or file refers to a block device inode.
  static readonly block_device: Value<Filetype> = Value(1);

  // The file descriptor or file refers to a character device inode.
  static readonly character_device: Value<Filetype> = Value(2);

  // The file descriptor or file refers to a directory inode.
  static readonly directory: Value<Filetype> = Value(3);

  // The file descriptor or file refers to a regular file inode.
  static readonly regular_file: Value<Filetype> = Value(4);

  // The file descriptor or file refers to a datagram socket.
  static readonly socket_dgram: Value<Filetype> = Value(5);

  // The file descriptor or file refers to a byte-stream socket.
  static readonly socket_stream: Value<Filetype> = Value(6);

  // The file refers to a symbolic link inode.
  static readonly symbolic_link: Value<Filetype> = Value(7);
}

// File descriptor flags.
export class Fdflags implements Data<"fdflags"> {
  readonly __data = "fdflags";

  static readonly size = 2;
  static readonly alignment = 2;

  constructor(
    private readonly flags: Value<Fdflags>,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Fdflags>,
    offset: Offset = 0,
  ): Fdflags {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    return new Fdflags(
      Value(data.getUint16(0, true)),
    );
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<Fdflags>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    data.setUint16(0, this.flags, true);
  }

  // Append mode: Data written to the file is always appended to the file's end.
  static readonly append: Value<Fdflags> = Value(1 << 0);

  get append(): boolean {
    return (this.flags & Fdflags.append) > 0;
  }

  // Write according to synchronized I/O data integrity completion. Only the
  // data stored in the file is synchronized.
  static readonly dsync: Value<Fdflags> = Value(1 << 1);

  get dsync(): boolean {
    return (this.flags & Fdflags.dsync) > 0;
  }

  // Non-blocking mode
  static readonly nonblock: Value<Fdflags> = Value(1 << 2);

  get nonblock(): boolean {
    return (this.flags & Fdflags.nonblock) > 0;
  }

  // Synchronized read I/O operations.
  static readonly rsync: Value<Fdflags> = Value(1 << 3);

  get rsync(): boolean {
    return (this.flags & Fdflags.rsync) > 0;
  }

  // Write according to synchronized I/O file integrity completion. In addition
  // to synchronizing the data stored in the file, the implementation may also
  // synchronously update the file's metadata.
  static readonly sync: Value<Fdflags> = Value(1 << 4);

  get sync(): boolean {
    return (this.flags & Fdflags.sync) > 0;
  }
}

type InitFdstat = {
  readonly fs_filetype: Filetype;
  readonly fs_flags: Fdflags;
  readonly fs_rights_base: Rights;
  readonly fs_rights_inheriting: Rights;
};

// File descriptor attributes.
export class Fdstat implements Data<"fdstat"> {
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
  }: InitFdstat) {
    this.fs_filetype = fs_filetype;
    this.fs_flags = fs_flags;
    this.fs_rights_base = fs_rights_base;
    this.fs_rights_inheriting = fs_rights_inheriting;
  }

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Fdstat>,
    offset: Offset = 0,
  ): Fdstat {
    return new Fdstat({
      fs_filetype: Filetype.cast(mem, Pointer(ptr), offset),
      fs_flags: Fdflags.cast(mem, Pointer(ptr), offset + 2),
      fs_rights_base: Rights.cast(mem, Pointer(ptr), offset + 8),
      fs_rights_inheriting: Rights.cast(mem, Pointer(ptr), offset + 16),
    });
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<Fdstat>, offset: Offset = 0) {
    this.fs_filetype.store(mem, Pointer(ptr), offset);
    this.fs_flags.store(mem, Pointer(ptr), offset + 2);
    this.fs_rights_base.store(mem, Pointer(ptr), offset + 8);
    this.fs_rights_inheriting.store(mem, Pointer(ptr), offset + 16);
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
    mem: WebAssembly.Memory,
    ptr: Pointer<Userdata>,
    offset: Offset = 0,
  ): Userdata {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    return new Userdata(BigValue(data.getBigUint64(0, true)));
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<Userdata>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
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
    mem: WebAssembly.Memory,
    ptr: Pointer<Eventtype>,
    offset: Offset = 0,
  ): Eventtype {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    return new Eventtype(data.getUint8(0) as Value<Eventtype>);
  }

  // The time value of clock subscription_clock::id has reached timestamp
  // subscription_clock::timeout.
  static readonly clock = 0 as Value<Eventtype>;

  // File descriptor subscription_fd_readwrite::file_descriptor has data
  // available for reading. This event always triggers for regular files.
  static readonly fd_read = 1 as Value<Eventtype>;

  // File descriptor subscription_fd_readwrite::file_descriptor has capacity
  // available for writing. This event always triggers for regular files.
  static readonly fd_write = 2 as Value<Eventtype>;
}

export class Eventrwflags implements Data<"eventrwflags"> {
  readonly __data = "eventrwflags";

  static readonly size = 2;
  static readonly alignment = 2;

  constructor(
    private readonly flags: Value<Eventrwflags>,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Eventrwflags>,
    offset: Offset = 0,
  ): Eventrwflags {
    const data = new DataView(mem.buffer);
    return new Eventrwflags(
      Value(data.getUint16(addOffset(ptr, offset), true)),
    );
  }

  static readonly fdReadwriteHangup = 1;

  get fdReadwriteHangup(): boolean {
    return (this.flags & Eventrwflags.fdReadwriteHangup) > 0;
  }
}

// event_fd_readwrite: Record
//
// The contents of an event when type is eventtype::fd_read or eventtype::fd_write.
export class EventFdReadwrite implements Data<"event_fd_readwrite"> {
  readonly __data = "event_fd_readwrite";

  static readonly size = 16;
  static readonly alignment = 8;

  constructor(
    readonly nbytes: Filesize,
    readonly flags: Eventrwflags,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<EventFdReadwrite>,
    offset: Offset = 0,
  ): EventFdReadwrite {
    return new EventFdReadwrite(
      Filesize.cast(mem, Pointer(ptr), offset),
      Eventrwflags.cast(mem, Pointer(ptr), offset + 8),
    );
  }
}

export class Subclockflags {
  readonly size = 2;
  constructor(
    private readonly flags: number,
  ) {}

  subscriptionClockAbstime(): boolean {
    return (this.flags & 1) > 0;
  }
}

// subscription_clock: Record
//
// The contents of a subscription when type is eventtype::clock.
export class SubscriptionClock {
  readonly size = 32;
  constructor(
    readonly id: Clockid,
    readonly timeout: Timestamp,
    readonly precision: Timestamp,
    readonly flags: Subclockflags,
  ) {}
}

// subscription_fd_readwrite: Record
//
// The contents of a subscription when type is type is eventtype::fd_read or eventtype::fd_write.
export class SubscriptionFdReadwrite {
  readonly size = 4;
  constructor(
    readonly fd: Fd,
  ) {}
}

// subscription: Record
//
// Subscription to an event.
export class SubscriptionU implements Data<"subscription_u"> {
  readonly __data = "subscription_u";

  static readonly size = 40;
  static readonly alignment = 8;

  constructor(
    readonly type: Eventtype,
    readonly content: SubscriptionClock | SubscriptionFdReadwrite,
  ) {}
}

// Subscription to an event.
export class Subscription implements Data<"subscription"> {
  readonly __data = "subscription";

  static readonly size = 48;
  static readonly alignment = 8;

  constructor(
    readonly userdata: Userdata,
    readonly u: SubscriptionU,
  ) {}
}

// event: Record
//
// An event that occurred.
export class Event implements Data<"event"> {
  readonly __data = "event";

  static readonly size = 32;
  static readonly alignment = 8;

  constructor(
    readonly userdata: Userdata,
    readonly error: Errno,
    readonly type: Eventtype,
    readonly fdReadwrite: EventFdReadwrite,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Event>,
    offset: Offset = 0,
  ): Event {
    return new Event(
      Userdata.cast(mem, Pointer(ptr), offset),
      Errno.cast(mem, Pointer(ptr), offset + 8),
      Eventtype.cast(mem, Pointer(ptr), offset + 10),
      EventFdReadwrite.cast(mem, Pointer(ptr), offset + 16),
    );
  }
}

// TODO
export class Filestat implements Data<"filestat"> {
  readonly __data = "filestat";
}

export class Preopentype implements Data<"preopentype"> {
  readonly __data = "preopentype";

  static readonly size = 1;
  static readonly alignment = 1;

  constructor(
    private readonly value: Value<Preopentype>,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Preopentype>,
    offset: Offset = 0,
  ): Preopentype {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    return new Preopentype(Value(data.getUint8(0)));
  }

  store(
    mem: WebAssembly.Memory,
    ptr: Pointer<Preopentype>,
    offset: Offset = 0,
  ) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    data.setUint8(0, this.value);
  }

  // A pre-opened directory.
  static readonly dir: Value<Preopentype> = Value(0);

  dir(): boolean {
    return this.value === Preopentype.dir;
  }
}

type InitPrestatDir = {
  readonly pr_name_len: Size;
};

// The contents of a $prestat when type is `preopentype::dir`.
export class PrestatDir implements Data<"prestat_dir"> {
  readonly __data = "prestat_dir";

  static readonly size = 4;
  static readonly alignment = 4;

  // The length of the directory name for use with `fd_prestat_dir_name`.
  readonly pr_name_len: Size;

  constructor({
    pr_name_len,
  }: InitPrestatDir) {
    this.pr_name_len = pr_name_len;
  }

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<PrestatDir>,
    offset: Offset = 0,
  ): PrestatDir {
    return new PrestatDir({
      pr_name_len: Size.cast(mem, Pointer(ptr), offset),
    });
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<PrestatDir>, offset: Offset = 0) {
    this.pr_name_len.store(mem, Pointer(ptr), offset);
  }
}

type InitPrestat = {
  readonly type: Preopentype;
  readonly content: PrestatDir;
};

// Information about a pre-opened capability.
export class Prestat implements Data<"prestat"> {
  readonly __data = "prestat";

  static readonly size = 8;
  static readonly alignment = 4;

  readonly type: Preopentype;
  readonly content: PrestatDir;

  constructor({
    type,
    content,
  }: InitPrestat) {
    this.type = type;
    this.content = content;
  }

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Prestat>,
    offset: Offset = 0,
  ): Prestat {
    return new Prestat({
      type: Preopentype.cast(mem, Pointer(ptr), offset),
      content: PrestatDir.cast(mem, Pointer(ptr), offset + 4),
    });
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<Prestat>, offset: Offset = 0) {
    this.type.store(mem, Pointer(ptr), offset);
    this.content.store(mem, Pointer(ptr), offset + 4);
  }
}
