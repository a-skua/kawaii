package main

import (
	"log/slog"
	"os"
)

func main() {
	f, err := os.CreateTemp(".", "example")
	if err != nil {
		slog.Error(err.Error())
		return
	}
	defer func() {
		err := os.Remove(f.Name())
		if err != nil {
			slog.Error(err.Error())
			return
		}
	}()

	slog.Info("Created temp file: " + f.Name())
	if _, err := f.Write([]byte("Example Content")); err != nil {
		slog.Error(err.Error())
		return
	}

	if err := f.Close(); err != nil {
		slog.Error(err.Error())
		return
	}
}
