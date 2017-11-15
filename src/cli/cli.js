'use strict';

const args = require('./arguments');
const repl = require('repl');
const cliCommands = require('./commands');

/** Evaluating input. Wrapped in closure for persistence of story. */
function evaluateInput() {
  let story = args.loadStory();
  return (command, context, filename, callback) => {
    let output = '';
    [story, output] = cliCommands.evaluate(story, command);
    callback(null, output);
  }
}

function formatOutput(output) {
  return output;
}

repl.start({ 
  prompt: '> ', 
  eval: evaluateInput(), 
  writer: formatOutput 
});
