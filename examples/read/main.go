package main

import (
	"fmt"
	"io"
	"log/slog"
	"os"
)

func main() {
	f, err := os.Open("./hello.txt")
	if err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}
	b, err := io.ReadAll(f)
	if err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}
	fmt.Print(string(b))
}
