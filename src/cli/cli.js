#!/usr/bin/env node
'use strict';

const commands = require('./commands');
const repl = require('repl');

/**
 * Starts the CLI.
 * @returns {undefined}
 */
function startCli() {
  repl.start({ 
    prompt: '> ', 
    eval: evaluateInput(), 
    writer: (output) => output
  });
}

/**
 * Returns a function that evaluates the REPL input.
 * @returns {function} The function to evaluate the REPL input.
 */
function evaluateInput() {
  let story = null;
  return (command, context, filename, callback) => {
    let output = '';
    [story, output] = commands.evaluate(story, command);
    callback(null, output);
  }
}

// Start the CLI.
startCli();