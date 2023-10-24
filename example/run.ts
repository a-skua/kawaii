import runtime from "../kawaii.ts";
runtime(Deno.args.join(" "), import.meta.url, Deno.args.length > 1);
