// https://github.com/WebAssembly/WASI/blob/main/legacy/preview1/docs.md#variant-cases-1
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

// 16 bits
export type Fdflags = number;

export const Fdflags = {
  // append: bool Append mode: Data written to the file is always appended to the file's end.
  Append: 1 << 0,
  // dsync: bool Write according to synchronized I/O data integrity completion. Only the data stored in the file is synchronized.
  Dsync: 1 << 1,
  // nonblock: bool Non-blocking mode.
  Nonblock: 1 << 2,
  // rsync: bool Synchronized read I/O operations.
  Rsync: 1 << 3,
  // sync: bool Write according to synchronized I/O file integrity completion. In addition to synchronizing the data stored in the file, the implementation may also synchronously update the file's metadata.
  Sync: 1 << 4,
};

// 64 bits
export type Rights = bigint;

export const Rights = {
  // fd_datasync: bool The right to invoke fd_datasync. If path_open is set, includes the right to invoke path_open with fdflags::dsync.
  FdDataSync: 1n << 0n,
  // fd_read: bool The right to invoke fd_read and sock_recv. If rights::fd_seek is set, includes the right to invoke fd_pread.
  FdRead: 1n << 1n,
  // fd_seek: bool The right to invoke fd_seek. This flag implies rights::fd_tell.
  FdSeek: 1n << 2n,
  // fd_fdstat_set_flags: bool The right to invoke fd_fdstat_set_flags.
  FdFdstatSetFlags: 1n << 3n,
  // fd_sync: bool The right to invoke fd_sync. If path_open is set, includes the right to invoke path_open with fdflags::rsync and fdflags::dsync.
  FdSync: 1n << 4n,
  // fd_tell: bool The right to invoke fd_seek in such a way that the file offset remains unaltered (i.e., whence::cur with offset zero), or to invoke fd_tell.
  FdTell: 1n << 5n,
  // fd_write: bool The right to invoke fd_write and sock_send. If rights::fd_seek is set, includes the right to invoke fd_pwrite.
  FdWrite: 1n << 6n,
  // fd_advise: bool The right to invoke fd_advise.
  FdAdvise: 1n << 7n,
  // fd_allocate: bool The right to invoke fd_allocate.
  FdAllocate: 1n << 8n,
  // path_create_directory: bool The right to invoke path_create_directory.
  PathCreateDirectory: 1n << 9n,
  // path_create_file: bool If path_open is set, the right to invoke path_open with oflags::creat.
  PathCreateFile: 1n << 10n,
  // path_link_source: bool The right to invoke path_link with the file descriptor as the source directory.
  PathLinkSource: 1n << 11n,
  // path_link_target: bool The right to invoke path_link with the file descriptor as the target directory.
  PathLinkTarget: 1n << 12n,
  // path_open: bool The right to invoke path_open.
  PathOpen: 1n << 13n,
  // fd_readdir: bool The right to invoke fd_readdir.
  FdReaddir: 1n << 14n,
  // path_readlink: bool The right to invoke path_readlink.
  PathReadlink: 1n << 15n,
  // path_rename_source: bool The right to invoke path_rename with the file descriptor as the source directory.
  PathRenameSource: 1n << 16n,
  // path_rename_target: bool The right to invoke path_rename with the file descriptor as the target directory.
  PathRenameTarget: 1n << 17n,
  // path_filestat_get: bool The right to invoke path_filestat_get.
  PathFilestatGet: 1n << 18n,
  // path_filestat_set_size: bool The right to change a file's size. If path_open is set, includes the right to invoke path_open with oflags::trunc. Note: there is no function named path_filestat_set_size. This follows POSIX design, which only has ftruncate and does not provide ftruncateat. While such function would be desirable from the API design perspective, there are virtually no use cases for it since no code written for POSIX systems would use it. Moreover, implementing it would require multiple syscalls, leading to inferior performance.
  PathFilestatSetSize: 1n << 19n,
  // path_filestat_set_times: bool The right to invoke path_filestat_set_times.
  PathFilestatSetTimes: 1n << 20n,
  // fd_filestat_get: bool The right to invoke fd_filestat_get.
  FdFilestatGet: 1n << 21n,
  // fd_filestat_set_size: bool The right to invoke fd_filestat_set_size.
  FdFilestatSetSize: 1n << 22n,
  // fd_filestat_set_times: bool The right to invoke fd_filestat_set_times.
  FdFilestatSetTimes: 1n << 23n,
  // path_symlink: bool The right to invoke path_symlink.
  PathSymlink: 1n << 24n,
  // path_remove_directory: bool The right to invoke path_remove_directory.
  PathRemoveDirectory: 1n << 25n,
  // path_unlink_file: bool The right to invoke path_unlink_file.
  PathUnlinkFile: 1n << 26n,
  // poll_fd_readwrite: bool If rights::fd_read is set, includes the right to invoke poll_oneoff to subscribe to eventtype::fd_read. If rights::fd_write is set, includes the right to invoke poll_oneoff to subscribe to eventtype::fd_write.
  PollFdReadWrite: 1n << 27n,
  // sock_shutdown: bool The right to invoke sock_shutdown.
  SockShutdown: 1n << 28n,
  // sock_accept: bool The right to invoke sock_accept.
  SockAccept: 1n << 29n,
};

export class Fdstat {
  constructor(
    readonly fs_filetype: Filetype,
    readonly fs_flags: Fdflags,
    readonly fs_rights_base: Rights,
    readonly fs_rights_inheriting: Rights,
  ) {}

  toBuffer(): Uint8Array {
    const buf = new Uint8Array(24);
    const data = new DataView(buf.buffer);
    data.setUint8(0, this.fs_filetype);
    data.setUint16(2, this.fs_flags, true);
    data.setBigUint64(8, this.fs_rights_base, true);
    data.setBigUint64(16, this.fs_rights_inheriting, true);
    return buf;
  }
}
export type Pointer = number;

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
