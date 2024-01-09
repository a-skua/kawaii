import { Exitcode } from "./types.ts";
import {
  ArgsGet,
  ArgsSizesGet,
  ClockTimeGet,
  EnvironGet,
  EnvironSizesGet,
  FdClose,
  FdFdstatGet,
  FdFdstatSetFlags,
  FdPrestatDirName,
  FdPrestatGet,
  FdWrite,
  PollOneoff,
  ProcExit,
  RandomGet,
  SchedYield,
} from "./functions.ts";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export class Arg {
  buffer: Uint8Array;
  constructor(
    value: string,
  ) {
    this.buffer = encoder.encode(`${value}\0`);
  }

  toString() {
    return decoder.decode(this.buffer.subarray(0, this.buffer.length - 1));
  }
}

export interface Preview1 {
  args: Arg[];
  memory: WebAssembly.Memory;
  exitcode: Exitcode;
}

export type ImportModule = {
  sched_yield: SchedYield;

  args_get: ArgsGet;
  args_sizes_get: ArgsSizesGet;

  clock_time_get: ClockTimeGet;
  random_get: RandomGet;

  poll_oneoff: PollOneoff;
  fd_close: FdClose;

  fd_fdstat_get: FdFdstatGet;
  fd_fdstat_set_flags: FdFdstatSetFlags;
  fd_prestat_get: FdPrestatGet;
  fd_prestat_dir_name: FdPrestatDirName;
  fd_write: FdWrite;
  environ_get: EnvironGet;
  environ_sizes_get: EnvironSizesGet;
  proc_exit: ProcExit;
};
