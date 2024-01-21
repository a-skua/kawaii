.PHONY: all
all: walkdir.wasm fetch.wasm file.wasm

%.wasm: %/*.go go.mod
	GOOS=wasip1 GOARCH=wasm go build -o $@ ./$*

.PHONY: example
example: all
	deno task example walkdir.wasm ..
	deno task example fetch.wasm
	deno task example file.wasm
