export type Pointer<_> = number;

type Offset = number;

export type Value<_> = number;

export type BigValue<_> = bigint;

const addOffset = <T>(ptr: Pointer<T>, offset: Offset): Pointer<T> =>
  ptr + (offset * 8);

export type U8 = number;

export type Size = number;

export type Fd = number;

export const Fd = {
  Stdin: 0,
  Stdout: 1,
  Stderr: 2,
};

// Error codes returned by functions. Not all of these error codes are returned
// by the functions provided by this API; some are used in higher-level library
// layers, and others are provided merely for alignment with POSIX.
export enum Errno {
  // success No error occurred. System call completed successfully.
  Success,
  // 2big Argument list too long.
  Toobig,
  // acces Permission denied.
  Acces,
  // addrinuse Address in use.
  Addrinuse,
  // addrnotavail Address not available.
  Addrnotavail,
  // afnosupport Address family not supported.
  Afnosupport,
  // again Resource unavailable, or operation would block.
  Again,
  // already Connection already in progress.
  Already,
  // badf Bad file descriptor.
  Badf,
  // badmsg Bad message.
  Badmsg,
  // busy Device or resource busy.
  Busy,
  // canceled Operation canceled.
  Canceled,
  // child No child processes.
  Child,
  // connaborted Connection aborted.
  Connaborted,
  // connrefused Connection refused.
  Connrefused,
  // connreset Connection reset.
  Connreset,
  // deadlk Resource deadlock would occur.
  Deadlk,
  // destaddrreq Destination address required.
  Destaddrreq,
  // dom Mathematics argument out of domain of function.
  Dom,
  // dquot Reserved.
  Dquot,
  // exist File exists.
  Exist,
  // fault Bad address.
  Fault,
  // fbig File too large.
  Fbig,
  // hostunreach Host is unreachable.
  Hostunreach,
  // idrm Identifier removed.
  Idrm,
  // ilseq Illegal byte sequence.
  Ilseq,
  // inprogress Operation in progress.
  Inprogress,
  // intr Interrupted function.
  Intr,
  // inval Invalid argument.
  Inval,
  // io I/O error.
  Io,
  // isconn Socket is connected.
  Isconn,
  // isdir Is a directory.
  Isdir,
  // loop Too many levels of symbolic links.
  Loop,
  // mfile File descriptor value too large.
  Mfile,
  // mlink Too many links.
  Mlink,
  // msgsize Message too large.
  Msgsize,
  // multihop Reserved.
  Multihop,
  // nametoolong Filename too long.
  Nametoolong,
  // netdown Network is down.
  Netdown,
  // netreset Connection aborted by network.
  Netreset,
  // netunreach Network unreachable.
  Netunreach,
  // nfile Too many files open in system.
  Nfile,
  // nobufs No buffer space available.
  Nobufs,
  // nodev No such device.
  Nodev,
  // noent No such file or directory.
  Noent,
  // noexec Executable file format error.
  Noexec,
  // nolck No locks available.
  Nolck,
  // nolink Reserved.
  Nolink,
  // nomem Not enough space.
  Nomem,
  // nomsg No message of the desired type.
  Nomsg,
  // noprotoopt Protocol not available.
  Noprotoopt,
  // nospc No space left on device.
  Nospc,
  // nosys Function not supported.
  Nosys,
  // notconn The socket is not connected.
  Notconn,
  // notdir Not a directory or a symbolic link to a directory.
  Notdir,
  // notempty Directory not empty.
  Notempty,
  // notrecoverable State not recoverable.
  Notrecoverable,
  // notsock Not a socket.
  Notsock,
  // notsup Not supported, or operation not supported on socket.
  Notsup,
  // notty Inappropriate I/O control operation.
  Notty,
  // nxio No such device or address.
  Nxio,
  // overflow Value too large to be stored in data type.
  Overflow,
  // ownerdead Previous owner died.
  Ownerdead,
  // perm Operation not permitted.
  Perm,
  // pipe Broken pipe.
  Pipe,
  // proto Protocol error.
  Proto,
  // protonosupport Protocol not supported.
  Protonosupport,
  // prototype Protocol wrong type for socket.
  Prototype,
  // range Result too large.
  Range,
  // rofs Read-only file system.
  Rofs,
  // spipe Invalid seek.
  Spipe,
  // srch No such process.
  Srch,
  // stale Reserved.
  Stale,
  // timedout Connection timed out.
  Timedout,
  // txtbsy Text file busy.
  Txtbsy,
  // xdev Cross-device link.
  Xdev,
  // notcapable Extension: Capabilities insufficient.
  Notcapable,
}

// The type of a file descriptor or file.
export class Filetype {
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
      data.getUint8(0),
    );
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<Filetype>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    data.setUint8(0, this.value);
  }

  // The type of the file descriptor or file is unknown or is different from any of the other types specified.
  static readonly unknown = 0;

  // The file descriptor or file refers to a block device inode.
  static readonly block_device = 1;

  // The file descriptor or file refers to a character device inode.
  static readonly character_device = 2;

  // The file descriptor or file refers to a directory inode.
  static readonly directory = 3;

  // The file descriptor or file refers to a regular file inode.
  static readonly regular_file = 4;

  // The file descriptor or file refers to a datagram socket.
  static readonly socket_dgram = 5;

  // The file descriptor or file refers to a byte-stream socket.
  static readonly socket_stream = 6;

  // The file refers to a symbolic link inode.
  static readonly symbolic_link = 7;
}

// File descriptor flags.
export class Fdflags {
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
      data.getUint16(0, true),
    );
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<Fdflags>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    data.setUint16(0, this.flags, true);
  }

  // Append mode: Data written to the file is always appended to the file's end.
  static readonly append = 1;

  get append(): boolean {
    return (this.flags & Fdflags.append) > 0;
  }

  // Write according to synchronized I/O data integrity completion. Only the
  // data stored in the file is synchronized.
  static readonly dsync = 2;

  get dsync(): boolean {
    return (this.flags & Fdflags.dsync) > 0;
  }

  // Non-blocking mode
  static readonly nonblock = 4;

  get nonblock(): boolean {
    return (this.flags & Fdflags.nonblock) > 0;
  }

  // Synchronized read I/O operations.
  static readonly rsync = 8;

  get rsync(): boolean {
    return (this.flags & Fdflags.rsync) > 0;
  }

  // Write according to synchronized I/O file integrity completion. In addition
  // to synchronizing the data stored in the file, the implementation may also
  // synchronously update the file's metadata.
  static readonly sync = 16;

  get sync(): boolean {
    return (this.flags & Fdflags.sync) > 0;
  }
}

// File descriptor rights, determining which actions may be performed.
export class Rights {
  static readonly size = 8;
  static readonly alignment = 8;

  constructor(
    private readonly flags: BigValue<Rights>,
  ) {}

  static no(): Rights {
    return new Rights(0n);
  }

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Rights>,
    offset: Offset = 0,
  ): Rights {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    return new Rights(data.getBigUint64(0, true));
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<Rights>, offset: Offset = 0) {
    const data = new DataView(mem.buffer, addOffset(ptr, offset));
    data.setBigUint64(0, this.flags, true);
  }

  // The right to invoke fd_datasync. If path_open is set, includes the right to
  // invoke path_open with fdflags::dsync.
  static readonly fd_datasync = 1n << 0n;

  get fd_datasync(): boolean {
    return (this.flags & Rights.fd_datasync) > 0n;
  }

  // The right to invoke fd_read and sock_recv. If rights::fd_seek is set,
  // includes the right to invoke fd_pread.
  static readonly fd_read = 1n << 1n;

  get fd_read(): boolean {
    return (this.flags & Rights.fd_read) > 0n;
  }

  // The right to invoke fd_seek. This flag implies rights::fd_tell.
  static readonly fd_seek = 1n << 2n;

  get fd_seek(): boolean {
    return (this.flags & Rights.fd_seek) > 0n;
  }

  // The right to invoke fd_fdstat_set_flags.
  static readonly fd_fdstat_set_flags = 1n << 3n;

  get fd_fdstat_set_flags(): boolean {
    return (this.flags & Rights.fd_fdstat_set_flags) > 0n;
  }

  // The right to invoke fd_sync. If path_open is set, includes the right to
  // invoke path_open with fdflags::rsync and fdflags::dsync.
  static readonly fd_sync = 1n << 4n;

  get fd_sync(): boolean {
    return (this.flags & Rights.fd_sync) > 0n;
  }

  // The right to invoke fd_seek in such a way that the file offset remains
  // unaltered (i.e., whence::cur with offset zero), or to invoke fd_tell.
  static readonly fd_tell = 1n << 5n;

  get fd_tell(): boolean {
    return (this.flags & Rights.fd_tell) > 0n;
  }

  // The right to invoke fd_write and sock_send. If rights::fd_seek is set,
  // includes the right to invoke fd_pwrite.
  static readonly fd_write = 1n << 6n;

  get fd_write(): boolean {
    return (this.flags & Rights.fd_write) > 0n;
  }

  // The right to invoke fd_advise.
  static readonly fd_advise = 1n << 7n;

  get fd_advise(): boolean {
    return (this.flags & Rights.fd_advise) > 0n;
  }

  // The right to invoke fd_allocate.
  static readonly fd_allocate = 1n << 8n;

  get fd_allocate(): boolean {
    return (this.flags & Rights.fd_allocate) > 0n;
  }

  // The right to invoke path_create_directory.
  static readonly path_create_directory = 1n << 9n;

  get path_create_directory(): boolean {
    return (this.flags & Rights.path_create_directory) > 0n;
  }

  // If path_open is set, the right to invoke path_open with oflags::creat.
  static readonly path_create_file = 1n << 10n;

  get path_create_file(): boolean {
    return (this.flags & Rights.path_create_file) > 0n;
  }

  // The right to invoke path_link with the file descriptor as the source
  // directory.
  static readonly path_link_source = 1n << 11n;

  get path_link_source(): boolean {
    return (this.flags & Rights.path_link_source) > 0n;
  }

  // The right to invoke path_link with the file descriptor as the target
  // directory.
  static readonly path_link_target = 1n << 12n;

  get path_link_target(): boolean {
    return (this.flags & Rights.path_link_target) > 0n;
  }

  // The right to invoke path_open.
  static readonly path_open = 1n << 13n;

  get path_open(): boolean {
    return (this.flags & Rights.path_open) > 0n;
  }

  // The right to invoke fd_readdir.
  static readonly fd_readdir = 1n << 14n;
  get fd_readdir(): boolean {
    return (this.flags & Rights.fd_readdir) > 0n;
  }

  // The right to invoke path_readlink.
  static readonly path_readlink = 1n << 15n;

  get path_readlink(): boolean {
    return (this.flags & Rights.path_readlink) > 0n;
  }

  // The right to invoke path_rename with the file descriptor as the source
  // directory.
  static readonly path_rename_source = 1n << 16n;

  get path_rename_source(): boolean {
    return (this.flags & Rights.path_rename_source) > 0n;
  }

  // The right to invoke path_rename with the file descriptor as the target
  // directory.
  static readonly path_rename_target = 1n << 17n;

  get path_rename_target(): boolean {
    return (this.flags & Rights.path_rename_target) > 0n;
  }

  // The right to invoke path_filestat_get.
  static readonly path_filestat_get = 1n << 18n;

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
  static readonly path_filestat_set_size = 1n << 19n;

  get path_filestat_set_size(): boolean {
    return (this.flags & Rights.path_filestat_set_size) > 0n;
  }

  // The right to invoke path_filestat_set_times.
  static readonly path_filestat_set_times = 1n << 20n;
  get path_filestat_set_times(): boolean {
    return (this.flags & Rights.path_filestat_set_times) > 0n;
  }

  // The right to invoke fd_filestat_get.
  static readonly fd_filestat_get = 1n << 21n;

  get fd_filestat_get(): boolean {
    return (this.flags & Rights.fd_filestat_get) > 0n;
  }

  // The right to invoke fd_filestat_set_size.
  static readonly fd_filestat_set_size = 1n << 22n;

  get fd_filestat_set_size(): boolean {
    return (this.flags & Rights.fd_filestat_set_size) > 0n;
  }

  // The right to invoke fd_filestat_set_times.
  static readonly fd_filestat_set_times = 1n << 23n;

  get fd_filestat_set_times(): boolean {
    return (this.flags & Rights.fd_filestat_set_times) > 0n;
  }

  // The right to invoke path_symlink.
  static readonly path_symlink = 1n << 24n;

  get path_symlink(): boolean {
    return (this.flags & Rights.path_symlink) > 0n;
  }

  // The right to invoke path_remove_directory.
  static readonly path_remove_directory = 1n << 25n;

  get path_remove_directory(): boolean {
    return (this.flags & Rights.path_remove_directory) > 0n;
  }

  // The right to invoke path_unlink_file.
  static readonly path_unlink_file = 1n << 26n;

  get path_unlink_file(): boolean {
    return (this.flags & Rights.path_unlink_file) > 0n;
  }

  // If rights::fd_read is set, includes the right to invoke poll_oneoff to
  // subscribe to eventtype::fd_read. If rights::fd_write is set, includes the
  // right to invoke poll_oneoff to subscribe to eventtype::fd_write.
  static readonly poll_fd_readwrite = 1n << 27n;

  get poll_fd_readwrite(): boolean {
    return (this.flags & Rights.poll_fd_readwrite) > 0n;
  }

  // The right to invoke sock_shutdown.
  static readonly sock_shutdown = 1n << 28n;

  get sock_shutdown(): boolean {
    return (this.flags & Rights.sock_shutdown) > 0n;
  }

  // The right to invoke sock_accept.
  static readonly sock_accept = 1n << 29n;

  get sock_accept(): boolean {
    return (this.flags & Rights.sock_accept) > 0n;
  }
}

type InitFdstat = {
  readonly fs_filetype: Filetype;
  readonly fs_flags: Fdflags;
  readonly fs_rights_base: Rights;
  readonly fs_rights_inheriting: Rights;
};

// File descriptor attributes.
export class Fdstat {
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
      fs_filetype: Filetype.cast(mem, ptr, offset),
      fs_flags: Fdflags.cast(mem, ptr, offset + 2),
      fs_rights_base: Rights.cast(mem, ptr, offset + 8),
      fs_rights_inheriting: Rights.cast(mem, ptr, offset + 16),
    });
  }

  store(mem: WebAssembly.Memory, ptr: Pointer<Fdstat>, offset: Offset = 0) {
    this.fs_filetype.store(mem, ptr, offset);
    this.fs_flags.store(mem, ptr, offset + 2);
    this.fs_rights_base.store(mem, ptr, offset + 8);
    this.fs_rights_inheriting.store(mem, ptr, offset + 16);
  }
}

export type Exitcode = number;

export type Timestamp = bigint;

export enum Clockid {
  // realtime The clock measuring real time. Time value zero corresponds with 1970-01-01T00:00:00Z.
  Realtime,
  // monotonic The store-wide monotonic clock, which is defined as a clock measuring real time, whose value cannot be adjusted and which cannot have negative clock jumps. The epoch of this clock is undefined. The absolute time value of this clock therefore has no meaning.
  Monotonic,
  // process_cputime_id The CPU-time clock associated with the current process.
  ProcessCputimeId,
  // thread_cputime_id The CPU-time clock associated with the current thread.
  ThreadCputimeId,
}

// [buf: Pointer<U8>, buf_len: Size]
export class Ciovec {
  readonly size = 8;
  constructor(readonly buf: Pointer<U8>, readonly len: Size) {}
  static cast(mem: WebAssembly.Memory, ptr: Pointer<Ciovec>): Ciovec {
    const data = new DataView(mem.buffer);
    return new Ciovec(data.getUint32(ptr, true), data.getUint32(ptr + 4, true));
  }
}

// userdata: u64
//
// User-provided value that may be attached to objects that is retained when extracted from the implementation.
type Userdata = bigint;

// eventtype: Variant
//
// Type of a subscription to an event or its occurrence.
export enum Eventtype {
  Clock,
  FdRead,
  FdWrite,
}

// filesize: u64
//
// Non-negative file size or length of a region within a file.
export type Filesize = bigint;

export class Eventrwflags {
  readonly size = 2;
  constructor(
    private readonly flags: number,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<Eventrwflags>,
  ): Eventrwflags {
    const data = new DataView(mem.buffer);
    return new Eventrwflags(data.getUint16(ptr, true));
  }

  static readonly fdReadwriteHangup = 1;

  get fdReadwriteHangup(): boolean {
    return (this.flags & Eventrwflags.fdReadwriteHangup) > 0;
  }
}

// event_fd_readwrite: Record
//
// The contents of an event when type is eventtype::fd_read or eventtype::fd_write.
export class EventFdReadwrite {
  readonly size = 16;
  constructor(
    readonly nbytes: Filesize,
    readonly flags: Eventrwflags,
  ) {}

  static cast(
    mem: WebAssembly.Memory,
    ptr: Pointer<EventFdReadwrite>,
  ): EventFdReadwrite {
    const data = new DataView(mem.buffer);
    return new EventFdReadwrite(
      data.getBigUint64(ptr, true),
      Eventrwflags.cast(mem, ptr + 8),
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
export class SubscriptionU {
  readonly size = 40;
  constructor(
    readonly type: Eventtype,
    readonly content: SubscriptionClock | SubscriptionFdReadwrite,
  ) {}
}

// Subscription to an event.
export class Subscription {
  readonly size = 48;
  constructor(
    readonly userdata: Userdata,
    readonly u: SubscriptionU,
  ) {}
}

// event: Record
//
// An event that occurred.
export class Event {
  readonly size = 32;
  constructor(
    readonly userdata: Userdata,
    readonly error: Errno,
    readonly type: Eventtype,
    readonly fdReadwrite: EventFdReadwrite,
  ) {}

  static cast(mem: WebAssembly.Memory, ptr: Pointer<Event>): Event {
    const data = new DataView(mem.buffer);
    return new Event(
      data.getBigUint64(ptr, true),
      data.getUint16(ptr + 8, true),
      data.getUint8(ptr + 10),
      EventFdReadwrite.cast(mem, ptr + 16),
    );
  }
}

// TODO
export class Filestat {}

// TODO
export class Iovec {}

// TODO
export class Prestat {}
