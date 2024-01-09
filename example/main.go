package main

import (
	"flag"
	"fmt"
	"os"
	"strconv"
)

var name = flag.String("name", "Your Name", "A name to say hello to.")

func init() {
	flag.Parse()
}

func isDebug() bool {
	n, _ := strconv.Atoi(os.Getenv("DEBUG"))
	return n > 0
}

func main() {
	if isDebug() {
		fmt.Println("Debug mode is on")
	}
	fmt.Printf("Hello, %s!\n", *name)
}
