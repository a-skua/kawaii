package main

import (
	"fmt"
	"io/fs"
	"log"
	"os"
	"strconv"
	"strings"
)

func isDebug() bool {
	n, _ := strconv.Atoi(os.Getenv("DEBUG"))
	return n > 0
}

func main() {
	if isDebug() {
		fmt.Println("Debug mode is on")
	}

	dir := strings.Join(os.Args[1:], " ")
	log.Println("walk", dir)
	fileSystem := os.DirFS(dir)
	fs.WalkDir(fileSystem, ".", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			log.Fatal(err)
		}
		log.Printf("%s (%s)\n", d, path)
		return nil
	})
}
