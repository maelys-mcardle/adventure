'use strict';

const fs = require('fs');
const path = require('path');

const loadStory = require('../compiler/loadstory/loadstory');
const storyEngine = require('../engine/engine');

module.exports = {
  evaluate: evaluateInput,
}

const builtinCommands = [
  {
    command: 'start',
    description: 'Start a new story',
    argument: 'story directory',
    callback: startNewStory
  },
  {
    command: 'save',
    description: 'Save story progress',
    argument: 'save file',
    callback: saveStoryProgress
  },
  {
    command: 'load',
    description: 'Load a story in progress',
    argument: 'save file',
    callback: loadStoryProgress
  },
  {
    command: 'debug',
    description: 'Dump of current game state',
    callback: dumpStoryState
  },
  {
    command: 'list',
    description: 'List commands for the story',
    callback: listActions
  },
  {
    command: 'help',
    description: 'List built-in commands',
    callback: help
  },
  {
    command: 'quit',
    description: 'Start a new story',
    callback: quit
  },
]

function evaluateInput(story, input) {
  let inputWords = input.split(' ');
  let command = inputWords.shift().trim();
  let argument = inputWords.join(' ').trim();
  
  if (command === '') {
    return [story, ''];
  }

  for (let builtin of builtinCommands) {
    if (command === builtin.command) {
      return builtin.callback(story, argument);
    }
  }

  // No matches. Must be game action.
  return runAction(story, input);
}

function startNewStory(story, storyDirectoryPath) {
  story = loadStory.load(storyDirectoryPath);
  return [story, 'Loaded ' + story.title];
}

function loadStoryProgress(story, savePath) {
  let storyAsJson = readFile(savePath);
  story = jsonToStory(storyAsJson);
  return [story, 'Loaded ' + story.title];
}

function saveStoryProgress(story, savePath) {
  let storyAsJson = storyToJson(story);
  writeFile(savePath, storyAsJson);
  return [story, 'Saved ' + story.title];
}

function listActions(story, argument) {
  let output = "list";
  return output;
}

function dumpStoryState(story, argument) {
  return [story, storyToJson(story)];
}

function runAction(story, input) {
  story, output = storyEngine.evaluateInput(story, input);
}

function help(story, argument) {
  let output = 'BUILT-IN COMMANDS\n\n';

  for (let builtin of builtinCommands) {
    output += ' ' + builtin.command +
      (('argument' in builtin) ? ' [' + builtin.argument + ']\n' : '\n') +
      '  ' + builtin.description + '\n\n';
  }
  return [story, output];
}

function quit(story, argument) {
  process.exit();
}

function writeFile(path, contents) {
  fs.writeFile(path, contents, error => {
    if (error) {
      return console.log(error);
    }
  });
}

function readFile(path) {
  let contents = fs.readFileSync(path).toString();
  return contents;
}

function storyToJson(story) {
  return JSON.stringify(story, null, 2);
}

function jsonToStory(json) {
  return JSON.parse(json);
}