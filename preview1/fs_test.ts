import { assertEquals } from "assert";
import {
  closeByFd,
  DeviceId,
  File,
  FileId,
  FileName,
  FileType,
  find,
  findByFd,
  open,
  Timestamp,
  Value,
} from "./fs.ts";
import * as WASI from "./type.ts";

Deno.test("DeviceId", async (t) => {
  await t.step("wasi_device()", () => {
    const id = new DeviceId(1024n as Value<bigint, DeviceId>);

    assertEquals(
      id.wasi_device(),
      new WASI.Device(1024n as WASI.BigValue<WASI.Device>),
    );
  });
});

Deno.test("Timestamp", async (t) => {
  await t.step("now()", () => {
    assertEquals(
      Timestamp.now(),
      new Timestamp(
        new Date() as Value<Date, Timestamp>,
      ),
    );
  });

  await t.step("wasi_timestamp", () => {
    assertEquals(
      Timestamp.now().wasi_timestamp(),
      new WASI.Timestamp(
        BigInt(new Date().getTime()) * 1_000_000n as WASI.BigValue<
          WASI.Timestamp
        >,
      ),
    );
  });
});

Deno.test("FileId", async (t) => {
  await t.step("wasi_inode()", () => {
    const id = new FileId(2048n as Value<bigint, FileId>);

    assertEquals(
      id.wasi_inode(),
      new WASI.Inode(2048n as WASI.BigValue<WASI.Inode>),
    );
  });
});

Deno.test("FileType", async (t) => {
  await t.step("wasi()", async (t) => {
    await t.step("dir", () => {
      const type = new FileType(FileType.dir);
      assertEquals(
        type.wasi_filetype(),
        new WASI.Filetype(WASI.Filetype.directory),
      );
    });

    await t.step("regularFile", () => {
      const type = new FileType(FileType.regularFile);
      assertEquals(
        type.wasi_filetype(),
        new WASI.Filetype(WASI.Filetype.regular_file),
      );
    });

    await t.step("characterDevice", () => {
      const type = new FileType(FileType.characterDevice);
      assertEquals(
        type.wasi_filetype(),
        new WASI.Filetype(WASI.Filetype.character_device),
      );
    });

    await t.step("unknown", () => {
      const type = new FileType(0 as Value<number, FileType>);
      assertEquals(
        type.wasi_filetype(),
        new WASI.Filetype(WASI.Filetype.unknown),
      );
    });
  });

  await t.step("dir", () => {
    const type = new FileType(FileType.dir);
    assertEquals(type.dir, true);
  });

  await t.step("regularFile", () => {
    const type = new FileType(FileType.regularFile);
    assertEquals(type.regularFile, true);
  });

  await t.step("characterDevice", () => {
    const type = new FileType(FileType.characterDevice);
    assertEquals(type.characterDevice, true);
  });
});

Deno.test("FileName", async (t) => {
  await t.step("zero()", () => {
    assertEquals(
      FileName.zero(),
      new FileName(""),
    );
  });

  await t.step("wasi_dirnamlen()", async (t) => {
    await t.step("世界", () => {
      const name = new FileName("世界");

      assertEquals(
        name.wasi_dirnamlen(),
        new WASI.Dirnamlen(6),
      );
    });
  });
});

Deno.test("File", async (t) => {
  await t.step("fullName", () => {
    assertEquals(
      File.root.fullName,
      "/",
    );
  });

  await t.step("type", async (t) => {
    await t.step("dir", () => {
      assertEquals(
        File.type.dir,
        new FileType(FileType.dir),
      );
    });

    await t.step("regularFile", () => {
      assertEquals(
        File.type.regularFile,
        new FileType(FileType.regularFile),
      );
    });

    await t.step("characterDevice", () => {
      assertEquals(
        File.type.characterDevice,
        new FileType(FileType.characterDevice),
      );
    });
  });

  await t.step("append()", () => {
    const file1 = new File({
      name: new FileName("file"),
      type: File.type.regularFile,
    });
    const file2 = new File(file1);
    const file3 = new File(file1);

    const dir = new File({
      name: new FileName("dir"),
      type: File.type.dir,
    });

    assertEquals(
      dir.append(file1, file2, file3),
      dir,
    );
    assertEquals(
      dir.children,
      [file1, file2, file3],
    );
  });

  await t.step("tree()", () => {
    const file = (new File({
      name: new FileName("tree_test_dir"),
      type: File.type.dir,
    })).append(
      new File({
        name: new FileName("tree_test_file"),
        type: File.type.regularFile,
      }),
      (new File({
        name: new FileName("tree_test_dir"),
        type: File.type.dir,
      })).append(
        new File({
          name: new FileName("tree_test_file"),
          type: File.type.regularFile,
        }),
      ),
    );
    File.root.append(file);

    assertEquals(
      file.tree(),
      "/tree_test_dir/\n/tree_test_dir/tree_test_file\n/tree_test_dir/tree_test_dir/\n/tree_test_dir/tree_test_dir/tree_test_file",
    );
  });

  await t.step("find()", async (t) => {
    const childFile1 = new File({
      name: new FileName("find_test_file1"),
      type: File.type.regularFile,
    });

    const childFile2 = new File({
      name: new FileName("find_test_file2"),
      type: File.type.regularFile,
    });

    const file = (new File({
      name: new FileName("find_test_dir1"),
      type: File.type.dir,
    })).append(
      childFile1,
      (new File({
        name: new FileName("find_test_dir2"),
        type: File.type.dir,
      })).append(
        childFile2,
      ),
    );

    await t.step(".", () => {
      assertEquals(
        file.find("."),
        file,
      );
    });

    await t.step("./undefined_file", () => {
      assertEquals(
        file.find("./undefined_file"),
        undefined,
      );
    });

    await t.step("./find_test_dir2/find_test_file2", () => {
      assertEquals(
        file.find("./find_test_dir2/find_test_file2"),
        childFile2,
      );
    });

    await t.step("./find_test_dir2/find_test_file3", () => {
      assertEquals(
        file.find("./find_test_dir2/find_test_file3"),
        undefined,
      );
    });
  });

  await t.step("wasi_fdstat()", () => {
    const file = new File({
      name: new FileName("file"),
      type: File.type.dir,
    });

    assertEquals(
      file.wasi_fdstat(),
      new WASI.Fdstat({
        fs_filetype: new WASI.Filetype(WASI.Filetype.directory),
        fs_flags: WASI.Fdflags.zero(),
        fs_rights_base: WASI.Rights.zero(),
        fs_rights_inheriting: WASI.Rights.zero(),
      }),
    );
  });

  await t.step("wasi_filestat()", () => {
    const file = new File({
      name: new FileName("file"),
      type: new FileType(FileType.regularFile),
    });
    const timestamp = Timestamp.now();

    assertEquals(
      file.wasi_filestat(),
      new WASI.Filestat({
        dev: new WASI.Device(0n),
        ino: new WASI.Inode(file.id.id),
        filetype: new WASI.Filetype(WASI.Filetype.regular_file),
        nlink: new WASI.Linkcount(0n),
        size: new WASI.Filesize(0n),
        atim: timestamp.wasi_timestamp(),
        mtim: timestamp.wasi_timestamp(),
        ctim: timestamp.wasi_timestamp(),
      }),
    );
  });

  await t.step("wasi_dirent()", () => {
    const file = new File({
      name: new FileName("file"),
      type: new FileType(FileType.regularFile),
    });

    assertEquals(
      file.wasi_dirent(new WASI.Dircookie(1n)),
      new WASI.Dirent({
        d_next: new WASI.Dircookie(1n),
        d_ino: new WASI.Inode(file.id.id),
        d_namlen: new WASI.Dirnamlen(4),
        d_type: new WASI.Filetype(WASI.Filetype.regular_file),
      }),
    );
  });
});

Deno.test("find()", async (t) => {
  await t.step("/", () => {
    assertEquals(find("/"), File.root);
  });

  await t.step("./", () => {
    assertEquals(find("./"), File.current);
  });

  await t.step("../", () => {
    File.current = File.root;

    assertEquals(find("../"), undefined);
  });
});

Deno.test("findByFd()", async (t) => {
  await t.step("stdout", () => {
    assertEquals(
      !!findByFd(new WASI.Fd(WASI.Fd.stdout)),
      true,
    );
  });

  await t.step("undefined fd", () => {
    assertEquals(
      !!findByFd(WASI.Fd.provide()),
      false,
    );
  });
});

Deno.test("close()", async (t) => {
  const file = new File({
    name: new FileName("test_file"),
    type: File.type.regularFile,
  });
  const fd = open(file);

  assertEquals(
    findByFd(fd),
    file,
  );

  closeByFd(fd);

  assertEquals(
    findByFd(fd),
    undefined,
  );
});
