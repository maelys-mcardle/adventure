'use strict';

const fs = require('fs');
const path = require('path');
const wrap = require('word-wrap');
const storyEngine = require('../engine/engine');

module.exports = {
  evaluate: evaluateInput,
}

const config = {

  // Width of CLI terminal, in characters.
  terminalWidth: 80,

  // List of built-in commands.
  builtinCommands: [
    {
      command: 'load',
      description: 'Load a story from a story directory or save file',
      argument: 'story directory or save file',
      examples: ['load examples/thehouse/', 'load savefile.json'],
      callback: loadStory
    },
    {
      command: 'save',
      description: 'Save story progress to a save file',
      argument: 'save file',
      examples: ['save savefile.json'],
      callback: saveStory
    },
    {
      command: 'reminder',
      description: 'Describe the current situation',
      callback: reminder
    },
    {
      command: 'debug',
      description: 'Dump of current game state',
      callback: dumpStoryState
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
}

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

  for (let builtin of config.builtinCommands) {
    if (command.toLowerCase() === builtin.command.toLowerCase()) {

      if (builtin.argument && argument == '') {
        return [story, `Missing ${builtin.argument}`]
      }

      return builtin.callback(story, argument);
    }
  }

  // No matches. Must be game action.
  return runAction(story, input);
}

/**
 * Loads a story.
 * @param {Story} story The previous story object, if any.
 * @param {string} storyPath Path to the story directory or save file.
 * @returns {[Story, string]} The loaded story and text output.
 */
function loadStory(story, storyPath) {

  try {

    let isDirectory = fs.lstatSync(storyPath).isDirectory();

    if (isDirectory) {
      return loadNewStory(story, storyPath);
    } else {
      return loadSavedStory(story, storyPath);
    }

  } catch (err) {
    return [story, `"${storyPath}" isn't a file or directory.`]
  }
}

/**
 * Loads a new story.
 * @param {Story} story The previous story object, if any.
 * @param {string} storyDirectoryPath Directory containing story files.
 * @returns {[Story, string]} The loaded story and text output.
 */
function loadNewStory(story, storyDirectoryPath) {
  let loadedStory = storyEngine.loadStory(storyDirectoryPath);
  let output = '';

  if (loadedStory != null) {
    output = getFullStoryOutput(loadedStory);
  }

  return [loadedStory, output]; 
}

/**
 * Loads a saved story.
 * @param {Story} story The previous story object, if any.
 * @param {string} savePath Path to saved story file.
 * @returns {[Story, string]} The loaded story and text output.
 */
function loadSavedStory(story, savePath) {
  let storyAsJson = readFile(savePath);
  let loadedStory = fromJson(storyAsJson);
  let output = getFullStoryOutput(loadedStory);
  return [loadedStory, output];
}

/**
 * Saves a story.
 * @param {Story} story The story object.
 * @param {string} savePath Path to save the story file.
 * @returns {[Story, string]} The story and text output.
 */
function saveStory(story, savePath) {

  if (story == null) {
    return [story, 'Load a story first.']
  }

  let storyAsJson = toJson(story);
  writeFile(savePath, storyAsJson);
  return [story, 'Saved.'];
}

/**
 * Dumps current story state into output.
 * @param {Story} story The story object.
 * @param {string} argument Unused.
 * @returns {[Story, string]} The story and text output.
 */
function dumpStoryState(story, argument) {

  if (story == null) {
    return [story, 'Load a story first.']
  }

  return [story, toJson(story)];
}

/**
 * Shows current story state.
 * @param {Story} story The story object.
 * @param {string} argument Unused.
 * @returns {[Story, string]} The story and text output.
 */
function reminder(story, argument) {

  if (story == null) {
    return [story, 'Load a story first.']
  }

  let output = getFullStoryOutput(story);
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
    return [story, 'Command not recognized.']
  }

  let [updatedStory, paragraphs] = storyEngine.evaluateInput(story, input);

  let output = normalizeStoryParagraphs(paragraphs) + '\n\n' + 
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

  for (let builtin of config.builtinCommands) {

    output += ` ${builtin.command}: ${builtin.description}\n` 
            + `   eg. "${builtin.command}`
            + ('argument' in builtin ? ` [${builtin.argument}]"\n` : '"\n');

    if ('examples' in builtin) {
      for (let example of builtin.examples) {
        output += `       "${example}"\n`;
      }
    }

    output += '\n';
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
function getFullStoryOutput(story) {
  let output = 
    `"${story.title}" by ${story.author}\n\n` +
    `${getStoryOutput(story)}\n\n` +
    listEligibleActions(story);
  return output;
}

/**
 * Gives the text for the story in its current state.
 * @param {Story} story The story object.
 * @returns {string} Text for the story.
 */
function getStoryOutput(story) {
  let paragraphs = storyEngine.getStoryOutput(story);
  return normalizeStoryParagraphs(paragraphs);
}

/**
 * Makes the story output printable on the terminal.
 * It makes it a single string, word-wrapped at a given width.
 * @param {string[]} paragraphs Story paragraphs
 * @returns {string} The normalized story output.
 */
function normalizeStoryParagraphs(paragraphs) {
  
  // Get the story output as a single string.
  let singleText = paragraphs.join('\n\n');

  // Make text fit in the terminal window.
  let wrappedText = 
    wrap(singleText, 
      {
        width: config.terminalWidth,
        indent: ''
      });
  
  return wrappedText;
}

/**
 * Lists example commands that the user can input.
 * @param {Story} story The story object.
 * @returns {string} Lists example eligible commands.
 */
function listEligibleActions(story) {
  let possibleActions = storyEngine.getInputExamples(story);
  let output = '';

  if (possibleActions.length > 0) {
    output = 'You can:\n' + 
      possibleActions.map(example => ' ' + example).sort().join('\n');
  }
  
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