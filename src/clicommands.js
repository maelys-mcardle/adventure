'use strict';

const fs = require('fs');
const path = require('path');

const compiler = require('./compiler/loadstory/loadstory');

module.exports = {
  evaluate: evaluateInput,
}

function evaluateInput(story, input) {
  let words = input.split(' ');
  let command = words.shift();
  let argument = words.join(' ');
  let output = '';

  switch(command) {
    case 'new':
      story = loadNewStory(argument);
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
      list(story, argument);
      break;
    default:
      story = runAction(story, input);
  }
  
  return story, output;
}

function loadNewStory(storyDirectoryPath) {
  return compiler.loadStory(storyDirectoryPath);
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

}

function runAction(story, input) {

}

function readHelpFile() {
  let helpFileDirectory = path.basename(__dirname);
  let helpFileName = 'clihelp.md';
  let helpPath = path.join(helpFileDirectory, helpFileName);
  let helpContents = readFile(helpPath);
  return helpContents;
}

function writeFile(path, contents) {
  fs.writeFile(storyFilePath, storyAsJson, error => {
    if(error) {
        return console.log(error);
    }
    console.log("Saved to " + storyFilePath);
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