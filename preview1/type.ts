// errno: Variant
//
// Error codes returned by functions. Not all of these error codes are returned by the functions provided by this API; some are used in higher-level library layers, and others are provided merely for alignment with POSIX.
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

// 8 bits
export enum Filetype {
  // unknown The type of the file descriptor or file is unknown or is different from any of the other types specified.
  Unknown,
  // block_device The file descriptor or file refers to a block device inode.
  BlockDevice,
  // character_device The file descriptor or file refers to a character device inode.
  CharacterDevice,
  // directory The file descriptor or file refers to a directory inode.
  Directory,
  // regular_file The file descriptor or file refers to a regular file inode.
  RegularFile,
  // socket_dgram The file descriptor or file refers to a datagram socket.
  SocketDgram,
  // socket_stream The file descriptor or file refers to a byte-stream socket.
  SocketStream,
  // symbolic_link The file refers to a symbolic link inode.
  SymbolicLink,
}

// fdflags: Record
//
// File descriptor flags.
export class Fdflags {
  readonly size = 2;
  constructor(
    private readonly flags: number,
  ) {}

  static cast(mem: WebAssembly.Memory, ptr: Pointer<Fdflags>): Fdflags {
    const data = new DataView(mem.buffer);
    return new Fdflags(
      data.getUint16(ptr, true),
    );
  }

  static readonly append = 1;
  static readonly dsync = 2;
  static readonly nonblock = 4;
  static readonly rsync = 8;
  static readonly sync = 16;

  // Append mode: Data written to the file is always appended to the file's end.
  get append(): boolean {
    return (this.flags & Fdflags.append) > 0;
  }

  // Write according to synchronized I/O data integrity completion. Only the data stored in the file is synchronized.
  get dsync(): boolean {
    return (this.flags & Fdflags.dsync) > 0;
  }

  // Non-blocking mode
  get nonblock(): boolean {
    return (this.flags & Fdflags.nonblock) > 0;
  }

  // Synchronized read I/O operations.
  get rsync(): boolean {
    return (this.flags & Fdflags.rsync) > 0;
  }

  // Write according to synchronized I/O file integrity completion. In addition to synchronizing the data stored in the file, the implementation may also synchronously update the file's metadata.
  get sync(): boolean {
    return (this.flags & Fdflags.sync) > 0;
  }
}

// 64 bits

export class Rights {
  readonly size = 8;
  constructor(
    private readonly flags: bigint,
  ) {}

  static readonly fdDatasync = 1n << 0n;
  static readonly fdRead = 1n << 1n;
  static readonly fdSeek = 1n << 2n;
  static readonly fdFdstatSetFlags = 1n << 3n;
  static readonly fdSync = 1n << 4n;
  static readonly fdTell = 1n << 5n;
  static readonly fdWrite = 1n << 6n;
  static readonly fdAdvise = 1n << 7n;
  static readonly fdAllocate = 1n << 8n;
  static readonly pathCreateDirectory = 1n << 9n;
  static readonly pathCreateFile = 1n << 10n;
  static readonly pathLinkSource = 1n << 11n;
  static readonly pathLinkTarget = 1n << 12n;
  static readonly pathOpen = 1n << 13n;
  static readonly fdReaddir = 1n << 14n;
  static readonly pathReadlink = 1n << 15n;
  static readonly pathRenameSource = 1n << 16n;
  static readonly pathRenameTarget = 1n << 17n;
  static readonly pathFilestatGet = 1n << 18n;
  static readonly pathFilestatSetSize = 1n << 19n;
  static readonly pathFilestatSetTimes = 1n << 20n;
  static readonly fdFilestatGet = 1n << 21n;
  static readonly fdFilestatSetSize = 1n << 22n;
  static readonly fdFilestatSetTimes = 1n << 23n;
  static readonly pathSymlink = 1n << 24n;
  static readonly pathRemoveDirectory = 1n << 25n;
  static readonly pathUnlinkFile = 1n << 26n;
  static readonly pollFdReadwrite = 1n << 27n;
  static readonly sockShutdown = 1n << 28n;
  static readonly sockAccept = 1n << 29n;

  static cast(mem: WebAssembly.Memory, ptr: Pointer<Rights>): Rights {
    const data = new DataView(mem.buffer);
    return new Rights(data.getBigUint64(ptr, true));
  }

  // The right to invoke fd_datasync. If path_open is set, includes the right to invoke path_open with fdflags::dsync.
  get fdDatasync(): boolean {
    return (this.flags & Rights.fdDatasync) > 0n;
  }

  // The right to invoke fd_read and sock_recv. If rights::fd_seek is set, includes the right to invoke fd_pread.
  get fdRead(): boolean {
    return (this.flags & Rights.fdRead) > 0n;
  }

  // The right to invoke fd_seek. This flag implies rights::fd_tell.
  get fdSeek(): boolean {
    return (this.flags & Rights.fdSeek) > 0n;
  }

  // The right to invoke fd_fdstat_set_flags.
  get fdFdstatSetFlags(): boolean {
    return (this.flags & Rights.fdFdstatSetFlags) > 0n;
  }

  // The right to invoke fd_sync. If path_open is set, includes the right to invoke path_open with fdflags::rsync and fdflags::dsync.
  get fdSync(): boolean {
    return (this.flags & Rights.fdSync) > 0n;
  }

  // The right to invoke fd_seek in such a way that the file offset remains unaltered (i.e., whence::cur with offset zero), or to invoke fd_tell.
  get fdTell(): boolean {
    return (this.flags & Rights.fdTell) > 0n;
  }

  // The right to invoke fd_write and sock_send. If rights::fd_seek is set, includes the right to invoke fd_pwrite.
  get fdWrite(): boolean {
    return (this.flags & Rights.fdWrite) > 0n;
  }

  // The right to invoke fd_advise.
  get fdAdvise(): boolean {
    return (this.flags & Rights.fdAdvise) > 0n;
  }

  // The right to invoke fd_allocate.
  get fdAllocate(): boolean {
    return (this.flags & Rights.fdAllocate) > 0n;
  }

  // The right to invoke path_create_directory.
  get pathCreateDirectory(): boolean {
    return (this.flags & Rights.pathCreateDirectory) > 0n;
  }

  // If path_open is set, the right to invoke path_open with oflags::creat.
  get pathCreateFile(): boolean {
    return (this.flags & Rights.pathCreateFile) > 0n;
  }

  // The right to invoke path_link with the file descriptor as the source directory.
  get pathLinkSource(): boolean {
    return (this.flags & Rights.pathLinkSource) > 0n;
  }

  // The right to invoke path_link with the file descriptor as the target directory.
  get pathLinkTarget(): boolean {
    return (this.flags & Rights.pathLinkTarget) > 0n;
  }

  // The right to invoke path_open.
  get pathOpen(): boolean {
    return (this.flags & Rights.pathOpen) > 0n;
  }

  // The right to invoke fd_readdir.
  get fdReaddir(): boolean {
    return (this.flags & Rights.fdReaddir) > 0n;
  }

  // The right to invoke path_readlink.
  get pathReadlink(): boolean {
    return (this.flags & Rights.pathReadlink) > 0n;
  }

  // The right to invoke path_rename with the file descriptor as the source directory.
  get pathRenameSource(): boolean {
    return (this.flags & Rights.pathRenameSource) > 0n;
  }

  // The right to invoke path_rename with the file descriptor as the target directory.
  get pathRenameTarget(): boolean {
    return (this.flags & Rights.pathRenameTarget) > 0n;
  }

  // The right to invoke path_filestat_get.
  get pathFilestatGet(): boolean {
    return (this.flags & Rights.pathFilestatGet) > 0n;
  }

  // The right to change a file's size. If path_open is set, includes the right to invoke path_open with oflags::trunc. Note: there is no function named path_filestat_set_size. This follows POSIX design, which only has ftruncate and does not provide ftruncateat. While such function would be desirable from the API design perspective, there are virtually no use cases for it since no code written for POSIX systems would use it. Moreover, implementing it would require multiple syscalls, leading to inferior performance.
  get pathFilestatSetSize(): boolean {
    return (this.flags & Rights.pathFilestatSetSize) > 0n;
  }

  // The right to invoke path_filestat_set_times.
  get pathFilestatSetTimes(): boolean {
    return (this.flags & Rights.pathFilestatSetTimes) > 0n;
  }

  // The right to invoke fd_filestat_get.
  get fdFilestatGet(): boolean {
    return (this.flags & Rights.fdFilestatGet) > 0n;
  }

  // The right to invoke fd_filestat_set_size.
  get fdFilestatSetSize(): boolean {
    return (this.flags & Rights.fdFilestatSetSize) > 0n;
  }

  // The right to invoke fd_filestat_set_times.
  get fdFilestatSetTimes(): boolean {
    return (this.flags & Rights.fdFilestatSetTimes) > 0n;
  }

  // The right to invoke path_symlink.
  get pathSymlink(): boolean {
    return (this.flags & Rights.pathSymlink) > 0n;
  }

  // The right to invoke path_remove_directory.
  get pathRemoveDirectory(): boolean {
    return (this.flags & Rights.pathRemoveDirectory) > 0n;
  }

  // The right to invoke path_unlink_file.
  get pathUnlinkFile(): boolean {
    return (this.flags & Rights.pathUnlinkFile) > 0n;
  }

  // If rights::fd_read is set, includes the right to invoke poll_oneoff to subscribe to eventtype::fd_read. If rights::fd_write is set, includes the right to invoke poll_oneoff to subscribe to eventtype::fd_write.
  get pollFdReadwrite(): boolean {
    return (this.flags & Rights.pollFdReadwrite) > 0n;
  }

  // The right to invoke sock_shutdown.
  get sockShutdown(): boolean {
    return (this.flags & Rights.sockShutdown) > 0n;
  }

  // The right to invoke sock_accept.
  get sockAccept(): boolean {
    return (this.flags & Rights.sockAccept) > 0n;
  }
}

export class Fdstat {
  readonly size = 24;
  constructor(
    readonly fsFiletype: Filetype,
    readonly fsFlags: Fdflags,
    readonly fsRightsBase: Rights,
    readonly fsRightsInheriting: Rights,
  ) {}

  static cast(mem: WebAssembly.Memory, ptr: Pointer<Fdstat>): Fdstat {
    const data = new DataView(mem.buffer);
    return new Fdstat(
      data.getUint8(ptr),
      Fdflags.cast(mem, ptr + 2),
      Rights.cast(mem, ptr + 8),
      Rights.cast(mem, ptr + 16),
    );
  }
}
export type Pointer<_> = number;

export type U8 = number;

export type Size = number;

export type Fd = number;

export const Fd = {
  Stdin: 0,
  Stdout: 1,
  Stderr: 2,
};

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
