'use strict';

const yaml = require('js-yaml');
const markdown = require('markdown').markdown;
const dot = require('graphlib-dot');
const path = require('path');
const {RawStory, RawAction, RawEntity, RawFile} = require('./rawclass');
const constants = require('../../constants');

module.exports = {
  parse: parseFiles
};

/**
 * Parses the story files and parses them in an intermediary format.
 * @param {File[]} storyFiles The files and their contents.
 * @returns {RawStory} The story in an intermediary format.
 */
function parseFiles(storyFiles) {
  let storyActions = {}
  let storyEntities = {}
  let storyConfig = {}
  let foundStory = false;

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
            foundStory = true;
            break;
          }

        default:
          break;
      }
    }
  }

  return new RawStory(foundStory, storyConfig, storyActions, storyEntities);
}

/**
 * Parses the story config file.
 * @param {File} file The original story config file and its contents.
 * @returns {Object} The parsed story config.
 */
function parseStoryConfigFile(file) {
  return yaml.load(file.contents);
}

/**
 * Parses an action file and parses it in an intermediary format.
 * @param {Object} actions A map containing all the parsed actions.
 * @param {File} file The original action file and its contents.
 * @returns {Object} The updated actions map.
 */
function parseActionFile(actions, file) {
  let key = getActionIdentifier(file);
  let value = yaml.load(file.contents);
  
  actions[key] = new RawAction();
  actions[key].name = getActionName(file);
  actions[key].path = getActionPath(file);
  actions[key].action = new RawFile(file.name, value);

  return actions;
}

/**
 * Parses an entity file and parses it in an intermediary format.
 * @param {Object} entities A map containing all the parsed entities.
 * @param {File} file The original entity file and its contents.
 * @returns {Object} The updated entities map.
 */
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

/**
 * Parses an entity file and parses it in an intermediary format.
 * @param {Object} entities A map containing all the parsed entities.
 * @param {File} file The original entity file and its contents.
 * @param {function} parseFunction The function to parse the file.
 * @param {string} type The file type.
 * @returns {Object} The updated entities map.
 */
function parseEntityFileWithFunction(entities, file, parseFunction, type) {
  let key = getEntityIdentifier(file);
  let value = parseFunction(file.contents);
  let parsedFile = new RawFile(file.name, value);

  if (!(key in entities)) {
    entities[key] = new RawEntity();
    entities[key].path = getEntityPath(file);
    entities[key].name = getEntityName(file);
  }
  
  entities[key][type].push(parsedFile);
  
  return entities;
}

/**
 * Returns an identifier for the entity.
 * @param {File} file An entity file.
 * @returns {string} The combined path and name of the entity.
 */
function getEntityIdentifier(file) {
  return [getEntityPath(file), getEntityName(file)].join(constants.PATH_SEP);
}

/**
 * Returns the entity path.
 * @param {File} file An entity file.
 * @returns {string} The entity path.
 */
function getEntityPath(file) {
  return file.directory.slice(1, -1).join(constants.PATH_SEP);
}

/**
 * Returns the entity name.
 * @param {File} file An entity file.
 * @returns {string} The entity name.
 */
function getEntityName(file) {
  return file.directory.slice(-1)[0];
}

/**
 * Returns an identifier for the action.
 * @param {File} file An action file.
 * @returns {string} The combined path and name of the action.
 */
function getActionIdentifier(file) {
  return [getActionPath(file), getActionName(file)].join(constants.PATH_SEP);
}

/**
 * Returns the action path.
 * @param {File} file An action file.
 * @returns {string} The action path.
 */
function getActionPath(file) {
  return file.directory.slice(1).join(constants.PATH_SEP);
}

/**
 * Returns the action name.
 * @param {File} file An action file.
 * @returns {string} The action name.
 */
function getActionName(file) {
  return file.name;
}
