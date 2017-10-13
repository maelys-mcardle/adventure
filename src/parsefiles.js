"use strict";

const jsYaml = require('js-yaml');
const markdown = require('markdown').markdown;
const path = require('path');

const loadFiles = require('./loadfiles');

const CONFIG_FILE_NAME = "config";

async function parseFiles(storyDirectory) {
  let storyFiles = await loadFiles.load(storyDirectory);
  let storyActions = {}
  let storyEntities = {}
  let storyConfig = {}

  for (let file of storyFiles) {
    if (file.directory.length > 0) {
      switch(file.directory[0]) {
        case "actions":
          storyActions = parseActionFile(storyActions, file);
          break;
        case "entities":
          storyEntities = parseEntityFile(storyEntities, file);
          break;
        case "":
          if (file.name === CONFIG_FILE_NAME && file.isYaml()) {
            storyConfig = parseStoryConfigFile(file);
            break;
          }
        default:
          break;
      }
    }
  }
  return storyFiles;
}

function parseActionFile(actions, file) {
  return actions;
}

function parseStoryConfigFile(file) {
  return jsYaml.load(file.contents);
}

function parseEntityFile(entities, file) {
  if (file.isYaml() && file.name === CONFIG_FILE_NAME) {
    return parseEntityConfigFile(entities, file);
  } else if (file.isMarkdown()) {
    return parseEntityTextFile(entities, file);
  } else if (file.isDot()) {
    return parseEntityStateFile(entities, file);
  }

  return entities;
}

function parseEntityConfigFile(entities, file) {
  return entities;
}

function parseEntityTextFile(entities, file) {
  let test = markdown.parse(file.contents);
  return entities;
}

function parseEntityStateFile(entities, file) {
  return entities;
}

parseFiles('samples/simple').then(files => {
  console.log(files)
}).catch(reason => console.log(reason))