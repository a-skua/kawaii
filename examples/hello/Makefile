BINARIES = hello.wasm hello

.PHONY: all
all: $(BINARIES)

.PHONY: clean
clean:
	rm -f $(BINARIES)

.PHONY: run
run: hello.wasm
	deno run main.ts

hello.wasm: *.go
	env GOOS=wasip1 GOARCH=wasm go build -o $@ .
hello: *.go
	go build -o $@ .
