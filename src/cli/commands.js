'use strict';

const fs = require('fs');
const path = require('path');
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
    command: 'refresh',
    description: 'Describe the current situation',
    callback: refresh
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

/**
 * Evaluates the user input.
 * @param {Story} story The story object.
 * @param {string} input User input.
 * @returns {[Story, string]} The updated story and text output.
 */
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

/**
 * Loads a new story.
 * @param {Story} story The previous story object, if any.
 * @param {string} storyDirectoryPath Directory containing story files.
 * @returns {[Story, string]} The loaded story and text output.
 */
function startNewStory(story, storyDirectoryPath) {
  let loadedStory = storyEngine.loadStory(storyDirectoryPath);
  let output = getLoadedStoryOutput(loadedStory);
  return [loadedStory, output];
}

/**
 * Loads a saved story.
 * @param {Story} story The previous story object, if any.
 * @param {string} savePath Path to saved story file.
 * @returns {[Story, string]} The loaded story and text output.
 */
function loadStoryProgress(story, savePath) {
  let storyAsJson = readFile(savePath);
  let loadedStory = fromJson(storyAsJson);
  let output = getLoadedStoryOutput(loadedStory);
  return [loadedStory, output];
}

/**
 * Saves a story.
 * @param {Story} story The story object.
 * @param {string} savePath Path to save the story file.
 * @returns {[Story, string]} The story and text output.
 */
function saveStoryProgress(story, savePath) {

  if (story == null) {
    return [story, 'Load a story first.']
  }

  let storyAsJson = toJson(story);
  writeFile(savePath, storyAsJson);
  return [story, 'Saved ' + story.title];
}

/**
 * Lists eligible actions on the story.
 * @param {Story} story The story object.
 * @param {string} argument Unused.
 * @returns {[Story, string]} The story and text output.
 */
function listActions(story, argument) {

  if (story == null) {
    return [story, 'Load a story first.']
  }

  let output = listEligibleActions(story);

  return [story, output];
}

/**
 * Dumps current story state into output.
 * @param {Story} story The story object.
 * @param {string} argument Unused.
 * @returns {[Story, string]} The story and text output.
 */
function dumpStoryState(story, argument) {
  return [story, toJson(story)];
}

/**
 * Shows current story state.
 * @param {Story} story The story object.
 * @param {string} argument Unused.
 * @returns {[Story, string]} The story and text output.
 */
function refresh(story, argument) {
  let output = describeCurrentState(story);
  return [story, output];
}

/**
 * Evaluates the current input against the story engine.
 * @param {Story} story The story object.
 * @param {string} input The user input.
 * @returns {[Story, string]} The story and text output.
 */
function runAction(story, input) {

  if (story == null) {
    return [story, '']
  }

  let [updatedStory, paragraphs] = storyEngine.evaluateInput(story, input);

  let output = paragraphs.join('\n\n') + '\n\n' + 
    listEligibleActions(updatedStory);

  return [updatedStory, output];
}

/**
 * Shows information on built-in commands.
 * @param {Story} story The story object.
 * @param {string} argument Unused.
 * @returns {[Story, string]} The story and help information on commands.
 */
function help(story, argument) {
  let output = 'BUILT-IN COMMANDS\n\n';

  for (let builtin of builtinCommands) {
    if ('argument' in builtin) {
      output += ` ${builtin.command} [${builtin.argument}]\n`;
    } else {
      output += ` ${builtin.command}\n`;
    }
    output += `  ${builtin.description}\n\n`;
  }
  
  return [story, output];
}

/**
 * Exits the CLI.
 * @param {Story} story The story object.
 * @param {string} argument Unused.
 * @returns {undefined}
 */
function quit(story, argument) {
  process.exit();
}

/**
 * Returns the text related to the loaded story and eligible actions.
 * @param {Story} story The story object.
 * @returns {string} Text output for the loaded story.
 */
function getLoadedStoryOutput(story) {
  let output = 
    `Loaded ${story.title}\n\n` +
    `${describeCurrentState(story)}\n\n` +
    listEligibleActions(story);
  return output;
}

/**
 * Gives the text for the story in its current state.
 * @param {Story} story The story object.
 * @returns {string} Text for the story.
 */
function describeCurrentState(story) {
  return storyEngine.describeCurrentState(story).join('\n\n');
}

/**
 * Lists example commands that the user can input.
 * @param {Story} story The story object.
 * @returns {string} Lists example eligible commands.
 */
function listEligibleActions(story) {
  let possibleActions = storyEngine.listInputExamples(story);
  let output = 'You can:\n' + 
    possibleActions.map(a => ' ' + a.text).sort().join('\n');
  return output;
}

/**
 * Writes a file.
 * @param {string} path The path to the file.
 * @param {string} contents The contents of the file.
 * @returns {undefined}
 */
function writeFile(path, contents) {
  fs.writeFile(path, contents, error => {
    if (error) {
      return console.log(error);
    }
  });
}

/**
 * Reads a file.
 * @param {string} path The path to the file.
 * @returns {string} The contents of the file.
 */
function readFile(path) {
  let contents = fs.readFileSync(path).toString();
  return contents;
}

/**
 * Serializes a JavaScript object.
 * @param {Object} object The JavaScript object.
 * @returns {string} The serialized object.
 */
function toJson(object) {
  return JSON.stringify(object, null, 2);
}

/**
 * Deserializes a JavaScript object.
 * @param {string} object The serialized object.
 * @returns {Object} The JavaScript object.
 */
function fromJson(object) {
  return JSON.parse(object);
}