import * as esbuild from "https://deno.land/x/esbuild@v0.19.11/mod.js";
await esbuild.build({
  entryPoints: ["xterm.ts"],
  bundle: true,
  outfile: "xterm.js",
  minify: true,
  platform: "browser",
});
esbuild.stop();
