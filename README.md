# Stank

[![Build Status](https://travis-ci.org/btoll/stank.svg?branch=master)](https://travis-ci.org/btoll/stank)

Code smells that stank...

- Assigning a variable name to a variable
- Function bodies that contain more than ten statements
- Multiple `return` statements within the same function body
- Nested ternary operators
- `arguments` (TODO)
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
    -f, --file | The file to analyze
    --html | Creates an html document of the tree
    -h, --help | Show help

## License

[MIT](LICENSE)

## Author

Benjamin Toll

[Esprima]: http://esprima.org/

