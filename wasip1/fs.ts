import { Fd, Fdflags } from "./types.ts";

new File([], "stdout");

export interface FS {
  parent: FS | null;
  children: FS[] | null;
  readonly isDir: boolean;
  readonly isFile: boolean;
  fdflags: Fdflags;
}

export class Dir implements FS {
  constructor(
    readonly parent: Dir | null,
    readonly name: string,
  ) {}

  fdflags = Fdflags(0);
  readonly children: FS[] = [];
  readonly isDir = true;
  readonly isFile = !this.isDir;
}

export class RegularFile implements FS {
  constructor(
    readonly parent: Dir,
    readonly name: string,
  ) {}

  fdflags = Fdflags(0);
  readonly children = null;
  readonly isFile = true;
  readonly isDir = !this.isFile;
}

export class CharacterDevice implements FS {
  constructor(
    readonly parent: Dir,
    readonly name: string,
  ) {}

  fdflags = Fdflags(0);
  readonly children = null;
  readonly isFile = true;
  readonly isDir = !this.isFile;
}

const dev = new Dir(null, "dev");
dev.children.push(new CharacterDevice(dev, "stdin"));
dev.children.push(new CharacterDevice(dev, "stdout"));
dev.children.push(new CharacterDevice(dev, "stderr"));

const _root: FS[] = [dev];

const _fd = new Map<Fd, FS>(
  dev.children.map((fs, i) => [Fd(i), fs]),
);

export function get(fd: Fd): FS | undefined {
  return _fd.get(fd);
}
