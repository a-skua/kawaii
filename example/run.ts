import runtime from "../kawaii.ts";

const debug = true;

runtime(Deno.args.join(" "), import.meta.url, debug);
