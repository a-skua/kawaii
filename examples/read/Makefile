BINARIES = read.wasm read

.PHONY: all
all: $(BINARIES)

.PHONY: clean
clean:
	rm -f $(BINARIES)

.PHONY: run
run: read.wasm
	deno run main.ts

read.wasm: *.go
	env GOOS=wasip1 GOARCH=wasm go build -o $@ .
read: *.go
	go build -o $@ .
