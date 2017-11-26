'use strict';

const yaml = require('js-yaml');
const markdown = require('markdown').markdown;
const dot = require('graphlib-dot');
const path = require('path');

const CONFIG_FILE_NAME = 'config';

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
        case 'actions':
          storyActions = parseActionFile(storyActions, file);
          break;
        case 'entities':
          storyEntities = parseEntityFile(storyEntities, file);
          break;
        case '':
          if (file.name === CONFIG_FILE_NAME && file.isYaml()) {
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
  if (file.isYaml() && file.name === CONFIG_FILE_NAME) {
    return parseEntityFileWithFunction(entities, file, yaml.load, 'config');
  } else if (file.isMarkdown()) {
    return parseEntityFileWithFunction(entities, file, markdown.parse, 'text');
  } else if (file.isDot()) {
    return parseEntityFileWithFunction(entities, file, dot.readMany, 'states');
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
  return entityPath(file) + '.' + entityName(file);
}

function entityPath(file) {
  return file.directory.slice(1, -1).join('.');
}

function entityName(file) {
  return file.directory.slice(-1)[0];
}

function actionIdentifier(file) {
  return actionPath(file) + '.' + actionName(file);
}

function actionPath(file) {
  return file.directory.slice(1).join('.');
}

function actionName(file) {
  return file.name;
}

class RawEntity {
  constructor() {
    this.name;
    this.path;
    this.states = [];
    this.text = [];
    this.config = [];
  }
}

class RawAction {
  constructor() {
    this.name;
    this.path;
    this.action;
  }
}

class RawStory {
  constructor(config, actions, entities) {
    this.name;
    this.path;
    this.config = config;
    this.actions = actions;
    this.entities = entities;
  }
}

class RawParsedFile {
  constructor(name, contents) {
    this.name = name;
    this.contents = contents;
  }
}
