package main

import (
	"bufio"
	"fmt"
	"log/slog"
	"os"
)

func main() {
	scanner := bufio.NewScanner(os.Stdin)

	fmt.Print("Your Name: ")
	scanner.Scan()
	if err := scanner.Err(); err != nil {
		slog.Error(err.Error())
		os.Exit(1)
	}

	name := scanner.Text()
	fmt.Println("Hello", name)
}
