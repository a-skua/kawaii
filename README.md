# kaWAii

```plane
    |`\_/`|
K A |  W A| I I
    `-----`
```

Small is Beautiful.

## Overview

`kaWAii` is an implementation for running WASI modules on the browser. Although
[browser_wasi_shim](https://github.com/bjorn3/browser_wasi_shim) already exists,
the goal is to pursue an environment that can be executed on a browser more
concisely.

### e.g.

```sh
# initialize
cd example
make

# run
deno task example walkdir.wasm .
```
