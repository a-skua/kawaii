package main

import (
	"fmt"
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
	fmt.Printf("Hello, %s\n", strings.Join(os.Args[1:], " "))
}
