'use strict';

const fs = require('fs');
const path = require('path');

const loadStory = require('../compiler/loadstory/loadstory');
const storyEngine = require('../engine/engine');
const eligibleActions = require('../engine/eligibleactions');

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
    command: 'exit',
    description: 'Leave the story',
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
  story = fromJson(storyAsJson);
  return [story, 'Loaded ' + story.title];
}

function saveStoryProgress(story, savePath) {
  let storyAsJson = toJson(story);
  writeFile(savePath, storyAsJson);
  return [story, 'Saved ' + story.title];
}

function listActions(story, argument) {
  let output = 'STORY COMMANDS\n\n';
  let examples = eligibleActions.listExamples(story);

  for (let actionName of Object.keys(examples)) {
    output += ' ' + actionName + ':\n';
    for (let actionExample of examples[actionName]) {
      output += '  "' + actionExample + '"\n';
    }
  }

  return [story, output];
}

function dumpStoryState(story, argument) {
  return [story, toJson(story)];
}

function runAction(story, input) {
  [story, output] = storyEngine.evaluateInput(story, input);
  return [story, output];
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

function toJson(object) {
  return JSON.stringify(object, null, 2);
}

function fromJson(object) {
  return JSON.parse(object);
}