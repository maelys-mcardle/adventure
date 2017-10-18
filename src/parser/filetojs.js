"use strict";

const yaml = require('js-yaml');
const markdown = require('markdown').markdown;
const dot = require('graphlib-dot');
const path = require('path');

const CONFIG_FILE_NAME = "config";

module.exports = {
  parse: parseFiles
};

async function parseFiles(storyFiles) {
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

  return new Story(storyConfig, storyActions, storyEntities);
}

function parseActionFile(actions, file) {
  let key = actionIdentifier(file);
  let value = yaml.load(file.contents);
  
  actions[key] = new Action();
  actions[key].name = actionName(file);
  actions[key].path = actionPath(file);
  actions[key].config = value;

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
    return parseEntityFileWithFunction(entities, file, dot.read, 'states');
  }

  return entities;
}

function parseEntityFileWithFunction(entities, file, parseFunction, type) {
  let key = entityIdentifier(file);
  let value = parseFunction(file.contents);

  if (!(key in entities)) {
    entities[key] = new Entity();
    entities[key].path = entityPath(file);
    entities[key].name = entityName(file);
  }
  
  entities[key][type][file.name] = value;
  
  return entities;
}

function entityIdentifier(file) {
  return entityPath(file) + '.' + entityName(file);
}

function entityPath(file) {
  return file.directory.slice(1, -1).join('.');
}

function entityName(file) {
  return file.directory.slice(-1, 1);
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

class Entity {
  constructor() {
    this.name;
    this.path;
    this.states = {};
    this.text = {};
    this.config = {};
  }
}

class Action {
  constructor() {
    this.name;
    this.path;
    this.config;
  }
}

class Story {
  constructor(config, actions, entities) {
    this.name;
    this.path;
    this.config = config;
    this.actions = actions;
    this.entities = entities;
  }
}
