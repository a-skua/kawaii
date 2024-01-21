import { Preview1 } from "../kawaii.ts";
import { Terminal } from "@xterm/xterm";

const term = new Terminal();
term.open(document.getElementById("terminal"));

term.write(`${Preview1.FS.File.current.fullName} $ `);
term.onData((input: string) => {
  switch (input) {
    case "\r":
      term.writeln("");
      term.write(`${Preview1.FS.File.current.fullName} $ `);
      break;
    default:
      term.write(input);
  }
});
