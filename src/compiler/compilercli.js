"use strict";

const loadStory = require('./loadstory/loadstory');

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .example('$0 -d samples/simple', 'load the story in the simple dir')
  .alias('d', 'directory')
  .nargs('d', 1)
  .describe('d', 'Load a story from the directory')
  .demandOption(['d'])
  .help('h')
  .alias('h', 'help')
  .argv;

let story = loadStory.loadJson(argv.directory);
console.log(story);
