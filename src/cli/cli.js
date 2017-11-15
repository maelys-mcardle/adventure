#!/usr/bin/env node
'use strict';

const args = require('./arguments');
const commands = require('./commands');
const repl = require('repl');

/** Evaluating input. Wrapped in closure for persistence of story. */
function evaluateInput() {
  let story = args.loadStory();
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
