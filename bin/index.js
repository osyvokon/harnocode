#!/usr/bin/env node
const harnocode = require('../harnocode.js');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const fs = require("fs");

const optionsDefs = [
  { name: "input", type: String, defaultOption: true },
  { name: "mask", type: String },
  { name: "skip-validation", type: Boolean, help: "Do not validate harnified code"}
]
const sections = [
  {
    header: 'Options',
    optionList: optionsDefs
  }
]
const options = commandLineArgs(optionsDefs);

if (!options.input && !options.mask) {
  const usage = commandLineUsage(sections);
  process.stdout.write(usage);
  process.exit(-1);
}

let mask;
if (!options.mask) {
  mask = `\
xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
 xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
  xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
   xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
    xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
     xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
      xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
       xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
       xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
      xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
     xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
    xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
   xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
  xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
 xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
xxxxxxxxxx           xxxxxxxxxxx      xxxxxxxxxx
`.repeat(10000);
} else {
  mask = fs.readFileSync(options.mask).toString();
}

harnocode.formatFile(options.input, mask, options);
