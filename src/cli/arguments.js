'use strict';

const storyEngine = require('../engine/engine');

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .example('$0 -d samples/simple', 'load the story in the simple dir')
  .alias('d', 'directory')
  .nargs('d', 1)
  .describe('d', 'Load a story from the directory')
  .help('h')
  .alias('h', 'help')
  .argv;

module.exports = {
  loadStory: loadStoryFromArguments
}

function loadStoryFromArguments() {
  if (argv.directory) {
    let story = storyEngine.loadStory(argv.directory);
    return story;
  }
  return null;
}