import runtime from "../kawaii.ts";

const debug = true;

console.debug(Deno.env.toObject());
runtime(Deno.args.join(" "), import.meta.url, debug);
