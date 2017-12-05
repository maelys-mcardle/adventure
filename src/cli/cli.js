#!/usr/bin/env node
'use strict';

const commands = require('./commands');
const repl = require('repl');

/** Evaluating input. Wrapped in closure for persistence of story. */
function evaluateInput() {
  let story = null;
  return (command, context, filename, callback) => {
    let output = '';
    [story, output] = commands.evaluate(story, command);
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
