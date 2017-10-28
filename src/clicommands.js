'use strict';

const fs = require('fs');
const path = require('path');

const loadStory = require('./compiler/loadstory/loadstory');
const storyEngine = require('./engine/engine');

module.exports = {
  evaluate: evaluateInput,
}

function evaluateInput(story, input) {
  let inputWords = input.split(' ');
  let command = inputWords.shift().trim();
  let argument = inputWords.join(' ').trim();
  let output = '';
  
  switch(command) {
    case 'start':
      story = startNewStory(argument);
      break;
    case 'load':
      story = loadStoryProgress(argument);
      break;
    case 'save':
      saveStoryProgress(story, argument);
      break;
    case 'help':
      output = help(story, argument);
      break;
    case 'list':
      output = list(story, argument);
      break;
    case 'quit':
      quit();
      break;
    default:
      story = runAction(story, input);
  }
  
  return [story, output];
}

function startNewStory(storyDirectoryPath) {
  return loadStory.load(storyDirectoryPath);
}

function loadStoryProgress(savePath) {
  let storyAsJson = readFile(savePath);
  let story = jsonToStory(storyAsJson);
  return story;
}

function saveStoryProgress(story, savePath) {
  let storyAsJson = storyToJson(story);
  writeFile(savePath, storyAsJson);
}

function help(story, topic) {
  let helpContents = readHelpFile();
  return helpContents;
}

function listActions(story) {
  let output = "list";
  return output;
}

function runAction(story, input) {
  story, output = storyEngine.evaluateInput(story, input);
}

function quit() {
  process.exit();
}

function readHelpFile() {
  let helpFileDirectory = path.basename(__dirname);
  let helpFileName = 'clihelp.md';
  let helpPath = path.join(helpFileDirectory, helpFileName);
  let helpContents = readFile(helpPath);
  return helpContents;
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