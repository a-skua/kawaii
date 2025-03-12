package main

import (
	"fmt"
	"io"
	"log/slog"
	"os"
)

func main() {
	// path := os.Args[1]
	path := "run.ts"

	file, err := os.Open(path)
	if err != nil {
		slog.Error(err.Error())
		return
	}

	contents, err := io.ReadAll(file)
	if err != nil {
		slog.Error(err.Error())
		return
	}

	fmt.Println(string(contents))
}
