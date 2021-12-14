Harnocode (Гарнокод)
====================

Reformats JavaScript code to look like an ASCII-art picture.

The code should stay functional after the transformation.



### Examples:

Here are functional copies of harnocode's [source code](./harnocode.js) formatted with itself:

* [Hearty harnocode](https://raw.githubusercontent.com/asivokon/harnocode/master/examples/harnocode.heart.js)
* [Ubuntu harnocode](https://raw.githubusercontent.com/asivokon/harnocode/master/examples/harnocode.ubuntu.js)
* [Apple's fan harnocode](https://raw.githubusercontent.com/asivokon/harnocode/master/examples/harnocode.apple.js)
* [Ukrainian harnocode](https://raw.githubusercontent.com/asivokon/harnocode/master/examples/harnocode.ukraine.js)
* [Yin and Yang harnocode](https://raw.githubusercontent.com/asivokon/harnocode/master/examples/harnocode.yin-yang.js)
* [DNA harnocode](https://raw.githubusercontent.com/asivokon/harnocode/master/examples/harnocode.dna.js)


### Installation

```
$ npm install -g harnocode
```


### Usage

Command-line:

```
$ harnocode ./examples/lodash.heart.js --mask masks/ubuntu.txt --split-long-lines > lodash.ubuntu.js
```

See

```
$ harnocode
```

for the full list of available options.


Node.js:

TODO



### Converting images to masks

TODO



### About

**Harnocode** v1 was written in ClojureScript during the DOU Hackathon on
21-22 February, 2015.

**Harnocode** v2 is a rewrite in a pure JavaScript. It adds support for
ECMAScript 2019, npm module and a command-line tool.
