package main

import (
	"flag"
	"fmt"
)

var name = flag.String("name", "Your Name", "A name to say hello to.")

func init() {
	flag.Parse()
}

func main() {
	fmt.Printf("Hello, %s!\n", *name)
}
