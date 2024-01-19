.PHONY: all
all: walkdir.wasm

%.wasm: %/*.go go.mod
	GOOS=wasip1 GOARCH=wasm go build -o $@ ./$*
