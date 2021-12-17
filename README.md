Harnocode
=========

Reformats JavaScript code to look like an ASCII-art picture of your choice. Like this:

```
                   const                          esprima   =
               require('esprima');            const   escodegen =
             require( 'escodegen') ;        const fs=require('fs');
           exports.harnocode=function(    code,mask,options){options=
          options||{ };const  format= {  safeConcatenation  :  true  ,
         escapeless:true,semicolons:true,renumber:true,quotes:'single'}
         ;code=escodegen.generate(esprima.parse(code),{format:format});
         const tokens=tokenize(code);const lines=splitMaskToGroups(mask
         );let  tokenIndex= 0; let groupIndex =0; let result =[ ];let
         splitStrings=options. splitStrings===undefined?false: options.
          splitStrings;let safe=options.safe===undefined?true:options.
           safe;function processMask(){return lines.map(groups=>{let
             lineResult=[ ];let  offset= 0;if( tokenIndex>=tokens .
              length)return ;groups .forEach (( group,i )=> {let
                groupWidth=group[0].length;let isBeforeNewline=i
                  ==groups.length -1;if( group.index<offset ){
                    groupWidth -= offset- group .index ; if(
                      groupWidth <= 0  ) return ; }  let
                        groupTokens=takeTokens (tokens ,
                          groupWidth , tokenIndex  , {
                            isBeforeNewline , safe ,
                              splitStrings}); let
                                groupTokensJustified
                                  = justify  (
                                    groupTokens
                                         ,
```

The code should stay functional after the transformation.

"Harnocode" (__ukr__. гарнокод) means "beautiful code" in the Ukrainian language.



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
