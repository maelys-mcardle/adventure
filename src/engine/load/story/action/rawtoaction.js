'use strict';

const constants = require('../../../constants');
const errors = require('../../../errors');
const log = require('../../../log');

module.exports = {
  parse: parseActions
};

/**
 * Parses the actions in the intermediary format and updates the story. 
 * @param {Object} rawActions The actions in the intermediary format.
 * @param {Story} story The story object.
 * @returns {Story} The updated story.
 */
function parseActions(rawActions, story) {

  for (let rawActionId in rawActions) {
    let rawAction = rawActions[rawActionId];
    let config = rawAction.action.contents;
    let action = story.newAction(rawAction.name, rawAction.path); 

    if (constants.KEY_TEMPLATES in config) {
      action = parseTemplates(action, config[constants.KEY_TEMPLATES]);
    }

    if (constants.KEY_DEFAULT in config) {
      action = parseDefaults(action, config[constants.KEY_DEFAULT]);
    }

    if (constants.KEY_ACTION in config) {
      action = parseActionType(action, config[constants.KEY_ACTION]);
    }

    if (constants.KEY_SYNONYMS in config) {
      action = parseSynonyms(action, config[constants.KEY_SYNONYMS]);
    }

    story.addAction(action);
  }

  return story;
}

/**
 * Parses the templates for an action.
 * @param {Action} action The action.
 * @param {string[]} templates The templates.
 * @returns {Action} The updated action.
 */
function parseTemplates(action, templates) {

  for (let template of templates) {
    action.addTemplate(template);
  }

  return action;
}

/**
 * Parses the defajlts for an action.
 * @param {Action} action The action.
 * @param {Object} defaults The defaults.
 * @returns {Action} The updated action.
 */
function parseDefaults(action, defaults) {

  if (constants.KEY_VALUE in defaults) {
    action.defaultPropertyValue = defaults[constants.KEY_VALUE];
  }

  return action;
}

/**
 * Parses the action type.
 * @param {Action} action The action.
 * @param {string} templates The action type.
 * @returns {Action} The updated action.
 */
function parseActionType(action, actionType) {
  switch(actionType) {

    case constants.KEY_CHANGE:
      action.changesPropertyValue = true;
      break;

    case constants.KEY_DESCRIBE:
      action.describesPropertyValue = true;
      break;

    default:
      log.warn(errors.ACTION_TYPE_INVALID(actionType));
      break;
  }

  return action;
}

/**
 * Parses the synonyms for an action.
 * @param {Action} action The action.
 * @param {Object} synonyms The synonyms.
 * @returns {Action} The updated action.
 */
function parseSynonyms(action, synonyms) {

  // Synonyms are alternative words that can be used in the
  // templates. So like 'say' can have the synonym 'speak',
  // 'talk'. Explicitly list all templates including these
  // synonyms.

  let newTemplates = [];

  for (let word of Object.keys(synonyms)) {
    for (let synonymForWord of synonyms[word]) {
      newTemplates = newTemplates.concat(
        parseSingleSynonym(word, synonymForWord, action.templates));
    }
  }

  action.templates = action.templates.concat(newTemplates);

  return action;
}

/**
 * Parses the templates for an action.
 * @param {string} word A word.
 * @param {string} synonymForWord A synonym for the word.
 * @param {string[]} templates The templates with the original word.
 * @returns {string[]} A new list of templates with synonyms.
 */
function parseSingleSynonym(word, synonymForWord, templates) {

  let newTemplates = [];

  for (let template of templates) {
    if (template.includes(word)) {
      let templateWithSynonym = replaceWord(template, word, synonymForWord);
      newTemplates.push(templateWithSynonym);
    } else {
      log.warn(errors.WORD_NOT_IN_TEMPLATE(word, template));
    }
  }

  return newTemplates;
}

/**
 * Replaces a word with a synonym.
 * @param {string} text The word containing the word.
 * @param {string} word A word.
 * @param {string} synonymForWord A synonym for the word.
 * @returns {string} The text with the word replaced.
 */
function replaceWord(text, word, synonymForWord) {
  // The \b{word}\b means that the whole word must be matched,
  // and not just a part of another word.
  return text.replace(RegExp(`\\b${word}\\b`, 'g'), synonymForWord);
}
