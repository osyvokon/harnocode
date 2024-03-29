#!/usr/bin/env node
const harnocode = require('../harnocode.js');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const fs = require("fs");


function loadMask(path)
{
  const defaultMask = `\
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
  if (!path)
    return defaultMask;

  return fs.readFileSync(options.mask).toString();

}




const optionsDefs = [
  { name: "input", type: String, defaultOption: true },
  { name: "mask", type: String },
  { name: "repeat", type: Boolean, help: "Repeat mask"},
  { name: "skip-validation", type: Boolean, help: "Do not validate harnified code"},
  { name: "split-long-strings", type: Boolean, help: "Split long strings to fit image better (but the AST won't be preserved)"},
  { name: "unsafe-strings", type: Boolean, help: "Do not add parenthesis around string splitting. Use with caution."},
  { name: "bryntum", type: Boolean, help: "Bryntum-specific magic" },
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

options.splitStrings = Boolean(options['split-long-strings'])
options.safe = !Boolean(options['unsafe-strings'])

let mask = loadMask(options.mask);
harnocode.formatFile(options.input, mask, options);
