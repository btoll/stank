# Stank

[![Build Status](https://travis-ci.org/btoll/stank.svg?branch=master)](https://travis-ci.org/btoll/stank)

Code smells that stank...

- Assigning a variable name to a variable
- Function bodies that contain more than ten statements
- Multiple `return` statements within the same function body
- Nested ternary operators
- `arguments`
- `instanceof`
- `new`
- `typeof`
- `this` (Wait, what? Yep.) (TODO)
- ???

## Installation

`npm install https://github.com/btoll/stank.git -g`

## Example

Dump the tree to `stdout`:

    stank -f Filters.js

Create an `html` document of the same tree:

    stank -f Filters.js --html

Redirect:

    stank -f Filters.js --html > foo

Pipe:

    stank -f Filters.js | tee foo

## Usage

    Property | Description
    ------------ | -------------
    --debug, -d | Turns on debug logging
    --file, -f | The file to analyze
    --html | Creates an html document of the analysis
    --verbose, -v | Shows code snippets
    --help, -h | Show help

## License

[MIT](LICENSE)

## Author

Benjamin Toll

[Esprima]: http://esprima.org/

