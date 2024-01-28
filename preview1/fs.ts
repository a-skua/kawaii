import * as WASI from "./type.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

interface Fs<T extends string> {
  __fs: T;
}

export type Value<T, V extends Fs<string>> = T & { __value: V };

abstract class FsValue<V, T extends string> implements Fs<T> {
  abstract readonly __fs: T;

  readonly value: Value<V, Fs<T>>;

  constructor(
    value: Value<V, Fs<T>> | V,
  ) {
    this.value = value as Value<V, Fs<T>>;
  }
}

export class DeviceId extends FsValue<bigint, "device_id"> {
  readonly __fs = "device_id";

  wasi_device(): WASI.Device {
    return new WASI.Device(
      this.value as bigint as WASI.BigValue<WASI.Device>,
    );
  }
}

const deviceId = new DeviceId(0n as Value<bigint, DeviceId>);

export class FileId extends FsValue<bigint, "file_id"> {
  readonly __fs = "file_id";

  wasi_inode(): WASI.Inode {
    return new WASI.Inode(
      this.value as bigint as WASI.BigValue<WASI.Inode>,
    );
  }
}

export class Timestamp extends FsValue<Date, "timestamp"> {
  readonly __fs = "timestamp";

  static now(): Timestamp {
    return new Timestamp(
      new Date() as Value<Date, Timestamp>,
    );
  }

  wasi_timestamp(): WASI.Timestamp {
    return new WASI.Timestamp(
      BigInt(this.value.getTime() * 1_000_000) as WASI.BigValue<WASI.Timestamp>,
    );
  }
}

export class FileType extends FsValue<number, "file_type"> {
  readonly __fs = "file_type";

  // Directory
  static readonly dir = 1 as Value<number, FileType>;

  get dir(): boolean {
    return this.value === FileType.dir;
  }

  // Regular File
  static readonly regularFile = 2 as Value<number, FileType>;

  get regularFile(): boolean {
    return this.value === FileType.regularFile;
  }

  // Character Device
  static readonly characterDevice = 3 as Value<number, FileType>;

  get characterDevice(): boolean {
    return this.value === FileType.characterDevice;
  }

  wasi_filetype(): WASI.Filetype {
    return new WASI.Filetype((() => {
      switch (this.value) {
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
export class FileName extends FsValue<string, "file_name"> {
  readonly __fs = "file_name";

  static zero(): FileName {
    return new FileName("");
  }

  wasi_dirnamlen(): WASI.Dirnamlen {
    return new WASI.Dirnamlen(this.blob.length);
  }

  get blob(): Uint8Array {
    return encoder.encode(this.value);
  }
}

export class FileContent extends FsValue<string, "file_content"> {
  readonly __fs = "file_content";

  get blob(): Uint8Array {
    return encoder.encode(this.value);
  }

  toString(): string {
    return this.value;
  }
}

type FileParams = {
  readonly name: FileName;
  readonly type: FileType;
  readonly timestamp?: Timestamp;
  readonly content?: FileContent;
  readonly wasi_fs_flags?: WASI.Fdflags;
  readonly wasi_fs_rights_base?: WASI.Rights;
  readonly wasi_fs_rights_inheriting?: WASI.Rights;
};

export class File implements Fs<"file"> {
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
      ? `${this.parent.fullName}${this.name.value}`
      : this.name.value) +
      (this.type.dir ? "/" : "");
  }

  private _content: FileContent;

  get content(): FileContent {
    return this._content;
  }

  set content(content: string) {
    this._content = new FileContent(content);
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
    content = new FileContent(""),
    wasi_fs_flags = WASI.Fdflags.zero(),
    wasi_fs_rights_base = WASI.Rights.zero(),
    wasi_fs_rights_inheriting = WASI.Rights.zero(),
  }: FileParams) {
    this.name = name;
    this.type = type;
    this._content = content;
    this._timestamp = timestamp;
    this._wasi_fs_flags = wasi_fs_flags;
    this._wasi_fs_rights_base = wasi_fs_rights_base;
    this._wasi_fs_rights_inheritiong = wasi_fs_rights_inheriting;
  }

  static async fetch(name: FileName, url: string): Promise<File> {
    const resp = await fetch(new URL(url, import.meta.url));
    if (!resp.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }

    return new File({
      name: name,
      type: File.type.regularFile,
      content: new FileContent(await resp.text()),
    });
  }

  // New Directory
  static dir(name: string): File {
    return new File({
      name: new FileName(name),
      type: File.type.dir,
    });
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

  static get home(): File {
    return home;
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

  // Append Children and Return Self
  append(...children: File[]): File {
    for (const child of children) {
      this._children.push(child);
      child._parent = this;
    }
    return this;
  }

  // Remove Children
  remove(...children: File[]): void {
    children.forEach((child) => {
      const index = this._children.indexOf(child);
      if (index < 0) {
        return;
      }

      this._children.splice(index, 1);
    });
  }

  find(path: string | string[]): File | undefined {
    if (typeof path === "string") {
      path = path.split("/");
    }

    switch (path[0]) {
      case "": // TODO deprecate
        return root.find(path.slice(1));
      case ".":
        // CASE: "./"
        if (path.slice(1)[0] === "") {
          return this;
        }
        return this.find(path.slice(1));
      case "..": // TODO deprecate
        return current.parent?.find(path.slice(1));
      case undefined:
        return this;
      default: {
        const child = this._children.find(
          (file) => file.name.value === path[0],
        );
        // CASE: "./dev/"
        if (path.slice(1)[0] === "") {
          return child;
        }
        return child?.find(
          path.slice(1),
        );
      }
    }
  }

  // Usage Debug
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

const root = File.dir("").append(
  File.dir("dev").append(stdin, stdout, stderr),
  File.dir("etc").append(
    // await File.fetch(new FileName("hosts"), "/etc/hosts"),
    // await File.fetch(new FileName("resolv.conf"), "/etc/resolv.conf"),
  ),
  File.dir("home").append(
    File.dir("kawaii"),
  ),
);

type FileStateParams = {
  readonly file: File;
  readonly wasi_fdflags: WASI.Fdflags;
};

export class FileState implements Fs<"file_state"> {
  readonly __fs = "file_state";

  readonly file: File;

  private readonly _wasi_fdflags: WASI.Fdflags;

  // Read Offset
  private _readOffset = 0;

  constructor({
    file,
    wasi_fdflags,
  }: FileStateParams) {
    this.file = file;
    this._wasi_fdflags = wasi_fdflags;
  }

  write(msg: string): void {
    if (this._wasi_fdflags.append) {
      this.file.content += msg;
    } else {
      this.file.content = msg;
    }
    this.hooks.forEach((hook) => hook("write", msg));
  }

  read(): FileContent {
    // TODO Refactoring
    this.hooks.forEach((hook) => hook("read", ""));
    const content = this.file.type.characterDevice
      ? new FileContent(prompt("") ?? "")
      : new FileContent(
        decoder.decode(this.file.content.blob.slice(this._readOffset)),
      );
    this._readOffset += content.blob.length;
    return content;
  }

  readonly hooks: ((event: "write" | "read", msg: string) => void)[] = [];
}

const home = root.find("/home/kawaii")!;

let current = home; // TODO

export const findFile = (path: string): File | undefined => {
  return current.find(path);
};

// TODO
const openMap = new Map<WASI.Value<number, WASI.Fd>, FileState>([
  [
    WASI.Fd.stdin,
    new FileState({ file: stdin, wasi_fdflags: WASI.Fdflags.zero() }),
  ],
  [
    WASI.Fd.stdout,
    new FileState({ file: stdout, wasi_fdflags: WASI.Fdflags.zero() }),
  ],
  [
    WASI.Fd.stderr,
    new FileState({ file: stderr, wasi_fdflags: WASI.Fdflags.zero() }),
  ],
  [
    WASI.Fd.home,
    new FileState({ file: home, wasi_fdflags: WASI.Fdflags.zero() }),
  ],
  [
    WASI.Fd.root as WASI.Value<number, WASI.Fd>,
    new FileState({ file: root, wasi_fdflags: WASI.Fdflags.zero() }),
  ],
]);

// File Open
export const open = (file: File, wasi_fdflags: WASI.Fdflags): WASI.Fd => {
  const fd = WASI.Fd.provide();
  openMap.set(fd.value, new FileState({ file, wasi_fdflags }));
  return fd;
};

export const find = (fd: WASI.Fd): FileState | undefined => {
  return openMap.get(fd.value);
};

export const close = (fd: WASI.Fd) => {
  openMap.delete(fd.value);
};
