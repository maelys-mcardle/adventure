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
    command: 'describe',
    description: 'Describe the current situation',
    callback: describe
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
  let loadedStory = loadStory.load(storyDirectoryPath);
  let output = 'Loaded ' + loadedStory.title + '\n\n' +
    storyEngine.describeCurrentState(loadedStory) + '\n\n' +
    listEligibleActions(loadedStory);
  return [loadedStory, output];
}

function loadStoryProgress(story, savePath) {
  let storyAsJson = readFile(savePath);
  let loadedStory = fromJson(storyAsJson);
  let output = 'Loaded ' + loadedStory.title + '\n\n' +
    storyEngine.describeCurrentState(loadedStory) + '\n\n' +
    listEligibleActions(loadedStory);
  return [loadedStory, output];
}

function saveStoryProgress(story, savePath) {

  if (story == null) {
    return [story, 'Load a story first.']
  }

  let storyAsJson = toJson(story);
  writeFile(savePath, storyAsJson);
  return [story, 'Saved ' + story.title];
}

function listActions(story, argument) {

  if (story == null) {
    return [story, 'Load a story first.']
  }

  let output = listEligibleActions(story);

  return [story, output];
}

function dumpStoryState(story, argument) {
  return [story, toJson(story)];
}

function describe(story, entity) {
  let output = storyEngine.describeCurrentState(story);
  return [story, output];
}

function runAction(story, input) {

  if (story == null) {
    return [story, 'Command not recognized.']
  }

  let [updatedStory, output] = storyEngine.evaluateInput(story, input);
  output += '\n\n' + listEligibleActions(updatedStory);

  return [updatedStory, output];
}

function listEligibleActions(story) {
  let possibleActions = eligibleActions.listExamples(story);
  let output = 'You can:\n' + 
    possibleActions.map(a => ' ' + a.text).join('\n');
  return output;
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