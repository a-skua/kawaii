.PHONY: all
all: walkdir.wasm fetch.wasm file.wasm

%.wasm: %/*.go go.mod
	GOOS=wasip1 GOARCH=wasm go build -o $@ ./$*
