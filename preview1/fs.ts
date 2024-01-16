import * as WASI from "./type.ts";

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

type FileParams = {
  name: string;
  type: FileType;
  timestamp?: Timestamp;
};

export class File implements FS<"file"> {
  readonly __fs = "file";

  readonly id: FileId = (() => {
    const { value: fileId } = genFileId.next();
    return fileId;
  })();

  // File Name
  readonly name: string;

  // File Type
  readonly type: FileType;

  static type: Record<"dir" | "regularFile" | "characterDevice", FileType> =
    Object.freeze({
      dir: new FileType(FileType.dir),
      regularFile: new FileType(FileType.regularFile),
      characterDevice: new FileType(FileType.characterDevice),
    });

  get fullName(): string {
    return (this.parent ? `${this.parent.fullName}${this.name}` : this.name) +
      (this.type.dir ? "/" : "");
  }

  // Create Timestamp
  private readonly _timestamp: Timestamp;

  constructor({
    name,
    type,
    timestamp = Timestamp.now(),
  }: FileParams) {
    this.name = name;
    this.type = type;
    this._timestamp = timestamp;
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
          (file) => file.name === path[0],
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
      fs_flags: WASI.Fdflags.zero(), // TODO
      fs_rights_base: WASI.Rights.zero(), // TODO
      fs_rights_inheriting: WASI.Rights.zero(), // TODO
    });
  }

  wasi_filestat(): WASI.Filestat {
    return new WASI.Filestat({
      dev: deviceId.wasi_device(),
      ino: this.id.wasi_inode(),
      filetype: this.type.wasi_filetype(), // TODO
      nlink: WASI.Linkcount.zero(), // TODO
      size: WASI.Filesize.zero(),
      atim: this._timestamp.wasi_timestamp(),
      mtim: this._timestamp.wasi_timestamp(),
      ctim: this._timestamp.wasi_timestamp(),
    });
  }
}

const root = (new File({
  name: "",
  type: new FileType(FileType.dir),
})).append(
  (new File({
    name: "dev",
    type: new FileType(FileType.dir),
  })).append(
    new File({ name: "stdin", type: new FileType(FileType.characterDevice) }),
    new File({ name: "stdout", type: new FileType(FileType.characterDevice) }),
    new File({ name: "stderr", type: new FileType(FileType.characterDevice) }),
  ),
);

let current = root;

export const find = (path: string): File | undefined => {
  return current.find(path);
};
