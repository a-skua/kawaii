package main

import (
	"io"
	"log/slog"
	"net/http"
)

func main() {
	slog.Info("fetch...")
	resp, err := http.Get("http://example.com")
	if err != nil {
		slog.Error(err.Error())
		return
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		slog.Error(err.Error())
		return
	}

	slog.Info(string(body))
}
