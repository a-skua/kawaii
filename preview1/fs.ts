import * as WASI from "./type.ts";

const encoder = new TextEncoder();

interface FS<T extends string> {
  __fs: T;
}

export type Value<T, V extends FS<string>> = T & { __value: V };

export class DeviceId implements FS<"device_id"> {
  readonly __fs = "device_id";

  constructor(
    readonly id: Value<bigint, DeviceId>,
  ) {}

  wasi_device(): WASI.Device {
    return new WASI.Device(
      this.id as bigint as WASI.BigValue<WASI.Device>,
    );
  }
}

const deviceId = new DeviceId(0n as Value<bigint, DeviceId>);

export class FileId implements FS<"file_id"> {
  readonly __fs = "file_id";

  constructor(
    readonly id: Value<bigint, FileId>,
  ) {}

  wasi_inode(): WASI.Inode {
    return new WASI.Inode(
      this.id as bigint as WASI.BigValue<WASI.Inode>,
    );
  }
}

export class Timestamp implements FS<"timestamp"> {
  readonly __fs = "timestamp";

  constructor(
    readonly date: Value<Date, Timestamp>,
  ) {}

  static now(): Timestamp {
    return new Timestamp(
      new Date() as Value<Date, Timestamp>,
    );
  }

  wasi_timestamp(): WASI.Timestamp {
    return new WASI.Timestamp(
      BigInt(this.date.getTime()) * 1_000_000n as WASI.BigValue<WASI.Timestamp>,
    );
  }
}

export class FileType implements FS<"file_type"> {
  readonly __fs = "file_type";

  constructor(
    private readonly type: Value<number, FileType>,
  ) {}

  // Directory
  static readonly dir = 1 as Value<number, FileType>;

  get dir(): boolean {
    return this.type === FileType.dir;
  }

  // Regular File
  static readonly regularFile = 2 as Value<number, FileType>;

  get regularFile(): boolean {
    return this.type === FileType.regularFile;
  }

  // Character Device
  static readonly characterDevice = 3 as Value<number, FileType>;

  get characterDevice(): boolean {
    return this.type === FileType.characterDevice;
  }

  wasi_filetype(): WASI.Filetype {
    return new WASI.Filetype((() => {
      switch (this.type) {
        case FileType.dir:
          return WASI.Filetype.directory;
        case FileType.regularFile:
          return WASI.Filetype.regular_file;
        case FileType.characterDevice:
          return WASI.Filetype.character_device;
        default:
          return WASI.Filetype.unknown;
      }
    })());
  }
}

const genFileId = (function* (): Iterator<FileId> {
  let id = 0n;

  while (true) {
    id += 1n;
    yield new FileId(id as Value<bigint, FileId>);
  }
})();

// File Name
export class FileName implements FS<"file_name"> {
  readonly __fs = "file_name";

  readonly str: Value<string, FileName>;

  constructor(
    str: Value<string, FileName> | string,
  ) {
    this.str = str as Value<string, FileName>;
  }

  static zero(): FileName {
    return new FileName("");
  }

  wasi_dirnamlen(): WASI.Dirnamlen {
    return new WASI.Dirnamlen(
      this.blob.length as WASI.Value<WASI.Dirnamlen>,
    );
  }

  get blob(): Uint8Array {
    return encoder.encode(this.str);
  }
}

type FileParams = {
  readonly name: FileName;
  readonly type: FileType;
  readonly timestamp?: Timestamp;
  readonly wasi_fs_flags?: WASI.Fdflags;
  readonly wasi_fs_rights_base?: WASI.Rights;
  readonly wasi_fs_rights_inheriting?: WASI.Rights;
};

export class File implements FS<"file"> {
  readonly __fs = "file";

  readonly id: FileId = (() => {
    const { value: fileId } = genFileId.next();
    return fileId;
  })();

  // File Name
  readonly name: FileName;

  // File Type
  readonly type: FileType;

  static type: Record<"dir" | "regularFile" | "characterDevice", FileType> =
    Object.freeze({
      dir: new FileType(FileType.dir),
      regularFile: new FileType(FileType.regularFile),
      characterDevice: new FileType(FileType.characterDevice),
    });

  get fullName(): string {
    return (this.parent
      ? `${this.parent.fullName}${this.name.str}`
      : this.name.str) +
      (this.type.dir ? "/" : "");
  }

  // Create Timestamp
  private readonly _timestamp: Timestamp;

  // WASI Data Type
  private _wasi_fs_flags: WASI.Fdflags;
  private readonly _wasi_fs_rights_base: WASI.Rights;
  private readonly _wasi_fs_rights_inheritiong: WASI.Rights;

  set wasi_fs_flags(flags: WASI.Fdflags) {
    this._wasi_fs_flags = flags;
  }

  constructor({
    name,
    type,
    timestamp = Timestamp.now(),
    wasi_fs_flags = WASI.Fdflags.zero(),
    wasi_fs_rights_base = WASI.Rights.zero(),
    wasi_fs_rights_inheriting = WASI.Rights.zero(),
  }: FileParams) {
    this.name = name;
    this.type = type;
    this._timestamp = timestamp;
    this._wasi_fs_flags = wasi_fs_flags;
    this._wasi_fs_rights_base = wasi_fs_rights_base;
    this._wasi_fs_rights_inheritiong = wasi_fs_rights_inheriting;
  }

  // structure
  private _parent?: File;
  private readonly _children: File[] = [];

  get parent(): File | undefined {
    return this._parent;
  }

  static get root(): File {
    return root;
  }

  static get current(): File {
    return current;
  }

  static set current(file: File) {
    current = file;
  }

  get children(): File[] {
    return this._children.slice();
  }

  append(...children: File[]): File {
    for (const child of children) {
      this._children.push(child);
      child._parent = this;
    }
    return this;
  }

  find(path: string | string[]): File | undefined {
    if (typeof path === "string") {
      path = path.split("/");
    }

    switch (path[0]) {
      case "":
        return root.find(path.slice(1));
      case ".":
        return this.find(path.slice(1));
      case "..":
        return current.parent?.find(path.slice(1));
      case undefined:
        return this;
      default:
        return this._children.find(
          (file) => file.name.str === path[0],
        )?.find(
          path.slice(1),
        );
    }
  }

  tree(): string {
    return [
      this.fullName,
      ...this._children.map((child) => child.tree()),
    ].join("\n");
  }

  wasi_fdstat(): WASI.Fdstat {
    return new WASI.Fdstat({
      fs_filetype: this.type.wasi_filetype(),
      fs_flags: this._wasi_fs_flags,
      fs_rights_base: this._wasi_fs_rights_base,
      fs_rights_inheriting: this._wasi_fs_rights_inheritiong,
    });
  }

  wasi_filestat(): WASI.Filestat {
    return new WASI.Filestat({
      dev: deviceId.wasi_device(),
      ino: this.id.wasi_inode(),
      filetype: this.type.wasi_filetype(),
      nlink: WASI.Linkcount.zero(), // TODO
      size: WASI.Filesize.zero(), // TODO
      atim: this._timestamp.wasi_timestamp(),
      mtim: this._timestamp.wasi_timestamp(),
      ctim: this._timestamp.wasi_timestamp(),
    });
  }

  wasi_dirent(next: WASI.Dircookie): WASI.Dirent {
    return new WASI.Dirent({
      d_next: next,
      d_ino: this.id.wasi_inode(),
      d_namlen: this.name.wasi_dirnamlen(),
      d_type: this.type.wasi_filetype(),
    });
  }
}

const stdin = new File({
  name: new FileName("stdin"),
  type: new FileType(FileType.characterDevice),
  wasi_fs_flags: new WASI.Fdflags(WASI.Fdflags.nonblock),
});
const stdout = new File({
  name: new FileName("stdout"),
  type: new FileType(FileType.characterDevice),
  wasi_fs_flags: new WASI.Fdflags(WASI.Fdflags.nonblock),
  wasi_fs_rights_base: new WASI.Rights(WASI.Rights.fd_write),
  wasi_fs_rights_inheriting: new WASI.Rights(WASI.Rights.fd_write),
});
const stderr = new File({
  name: new FileName("stderr"),
  type: new FileType(FileType.characterDevice),
  wasi_fs_flags: new WASI.Fdflags(WASI.Fdflags.nonblock),
  wasi_fs_rights_base: new WASI.Rights(WASI.Rights.fd_write),
  wasi_fs_rights_inheriting: new WASI.Rights(WASI.Rights.fd_write),
});

const root = (new File({
  name: FileName.zero(),
  type: new FileType(FileType.dir),
})).append(
  (new File({
    name: new FileName("dev"),
    type: new FileType(FileType.dir),
  })).append(stdin, stdout, stderr),
);

let current = root;

export const find = (path: string): File | undefined => {
  return current.find(path);
};

// TODO
const openMap = new Map<WASI.Value<WASI.Fd>, File>([
  [WASI.Fd.stdin, stdin],
  [WASI.Fd.stdout, stdout],
  [WASI.Fd.stderr, stderr],
]);

// File Open
export const open = (file: File): WASI.Fd => {
  const fd = WASI.Fd.provide();
  openMap.set(fd.value, file);
  return fd;
};

export const findByFd = (fd: WASI.Fd): File | undefined => {
  return openMap.get(fd.value);
};

export const closeByFd = (fd: WASI.Fd) => {
  openMap.delete(fd.value);
};
