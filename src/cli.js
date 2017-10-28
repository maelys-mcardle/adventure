'use strict';

const repl = require('repl');

const cliCommands = require('./clicommands');

/** Evaluating input. Wrapped in closure for persistence of story. */
function evaluateInput() {
  let story = null;
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
