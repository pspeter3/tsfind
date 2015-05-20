# tsfind

[![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage][coveralls-image]][coveralls-url]

Find TypeScript files for tsconfig

## Installation

```sh
npm install tsfind --save-dev
```

## Usage

`tsfind` can be used programatically but is meant to be used with primarily
through the command line interface.

### CLI Options

```
--tsconfig {string}            
    The path to the tsconfig. Defaults to "cwd/tsconfig.json"
--glob     {string | string[]} 
    The glob pattern to use. Will use the "filesGlob" key in tsconfig if not specified.
```

All additional files passed in will be explicitly used.

## Contributing

Feel free to fork and submit pull requests for the configuration. For a sanity
check:

```sh
git clone git@github.com:pspeter3/tsfind.git
cd tsfind
npm install
npm run typings
npm test
```

[npm-url]: https://www.npmjs.org/package/tsfind
[npm-image]: http://img.shields.io/npm/v/tsfind.svg?style=flat-square

[travis-url]: http://travis-ci.org/pspeter3/tsfind
[travis-image]: http://img.shields.io/travis/pspeter3/tsfind.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/pspeter3/tsfind
[coveralls-image]: https://img.shields.io/coveralls/pspeter3/tsfind/master.svg?style=flat-square
