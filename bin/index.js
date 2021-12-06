#!/usr/bin/env node
const harnocode = require('../harnocode.js');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');

const optionsDefs = [
  { name: "input", type: String, defaultOption: true },
  { name: "skip-validation", type: Boolean, help: "Do not validate harnified code"}
]
const sections = [
  {
    header: 'Options',
    optionList: optionsDefs
  }
]
const options = commandLineArgs(optionsDefs);

if (!options.input) {
  const usage = commandLineUsage(sections);
  process.stdout.write(usage);
  process.exit(-1);
}

harnocode.formatFile(options.input, options);
