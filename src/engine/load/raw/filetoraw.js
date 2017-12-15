'use strict';

const yaml = require('js-yaml');
const markdown = require('markdown').markdown;
const dot = require('graphlib-dot');
const path = require('path');
const {RawAction, RawEntity, RawParsedFile, RawStory} = require('./rawclass');
const constants = require('../../constants');

module.exports = {
  parse: parseFiles
};

function parseFiles(storyFiles) {
  let storyActions = {}
  let storyEntities = {}
  let storyConfig = {}

  for (let file of storyFiles) {
    if (file.directory.length > 0) {
      switch(file.directory[0]) {

        case constants.DIRECTORY_ACTIONS:
          storyActions = parseActionFile(storyActions, file);
          break;

        case constants.DIRECTORY_ENTITIES:
          storyEntities = parseEntityFile(storyEntities, file);
          break;

        case constants.DIRECTORY_ROOT:
          if (file.name === constants.FILE_NAME_STORY && file.isYaml()) {
            storyConfig = parseStoryConfigFile(file);
            break;
          }

        default:
          break;
      }
    }
  }

  return new RawStory(storyConfig, storyActions, storyEntities);
}

function parseActionFile(actions, file) {
  let key = actionIdentifier(file);
  let value = yaml.load(file.contents);
  
  actions[key] = new RawAction();
  actions[key].name = actionName(file);
  actions[key].path = actionPath(file);
  actions[key].action = new RawParsedFile(file.name, value);

  return actions;
}

function parseStoryConfigFile(file) {
  return yaml.load(file.contents);
}

function parseEntityFile(entities, file) {
  
  if (file.isYaml()) {
    return parseEntityFileWithFunction(entities, file, 
      yaml.load, constants.TYPE_YAML);

  } else if (file.isMarkdown()) {
    return parseEntityFileWithFunction(entities, file, 
      markdown.parse, constants.TYPE_MARKDOWN);

  } else if (file.isDot()) {
    return parseEntityFileWithFunction(entities, file, 
      dot.readMany, constants.TYPE_DOT);
  }

  return entities;
}

function parseEntityFileWithFunction(entities, file, parseFunction, type) {
  let key = entityIdentifier(file);
  let value = parseFunction(file.contents);
  let parsedFile = new RawParsedFile(file.name, value);

  if (!(key in entities)) {
    entities[key] = new RawEntity();
    entities[key].path = entityPath(file);
    entities[key].name = entityName(file);
  }
  
  entities[key][type].push(parsedFile);
  
  return entities;
}

function entityIdentifier(file) {
  return entityPath(file) + constants.PATH_SEP + entityName(file);
}

function entityPath(file) {
  return file.directory.slice(1, -1).join(constants.PATH_SEP);
}

function entityName(file) {
  return file.directory.slice(-1)[0];
}

function actionIdentifier(file) {
  return actionPath(file) + constants.PATH_SEP + actionName(file);
}

function actionPath(file) {
  return file.directory.slice(1).join(constants.PATH_SEP);
}

function actionName(file) {
  return file.name;
}
