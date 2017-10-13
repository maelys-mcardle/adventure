"use strict";

const yaml = require('js-yaml');
const markdown = require('markdown').markdown;
const dot = require('graphlib-dot');
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

  return new Story(storyConfig, storyActions, storyEntities);
}

function parseActionFile(actions, file) {
  let key = actionToIdentifier(file);
  let value = yaml.load(file.contents);
  actions[key] = value;

  return actions;
}

function parseStoryConfigFile(file) {
  return yaml.load(file.contents);
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
  let key = entityToIdentifier(file);
  let value = yaml.load(file.contents);

  if (!(key in entities)) {
    entities[key] = new Entity();
  }
  
  entities[key].config = value;
  
  return entities;
}

function parseEntityTextFile(entities, file) {
  let key = entityToIdentifier(file);
  let value = markdown.parse(file.contents);

  if (!(key in entities)) {
    entities[key] = new Entity();
  }
  
  entities[key].text = value;
  
  return entities;
}

function parseEntityStateFile(entities, file) {
  let key = entityToIdentifier(file);
  let value = dot.read(file.contents);

  if (!(key in entities)) {
    entities[key] = new Entity();
  }
  
  entities[key].states = value;
  
  return entities;
}

function entityToIdentifier(file) {
  return JSON.stringify(file.directory.slice(1));
}

function actionToIdentifier(file) {
  return JSON.stringify(file.directory.slice(1).concat(file.name));
}

class Entity {
  constructor() {
    this.states = {};
    this.text = {};
    this.config = {};
  }
}

class Story {
  constructor(config, actions, entities) {
    this.config = config;
    this.actions = actions;
    this.entities = entities;
  }
}

parseFiles('samples/simple').then(files => {
  console.log(files)
}).catch(reason => console.log(reason))