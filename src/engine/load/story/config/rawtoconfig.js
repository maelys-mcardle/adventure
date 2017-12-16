'use strict';

const constants = require('../../../constants');

module.exports = {
  parse: parseConfig
};

/**
 * Parses the config in the intermediary format and updates the story. 
 * @param {Object} rawConfig The config in the intermediary format.
 * @param {Story} story The story object.
 * @returns {Story} The updated story.
 */
function parseConfig(rawConfig, story) {

  if (constants.KEY_TITLE in rawConfig) {
    story.title = rawConfig[constants.KEY_TITLE];
  }

  if (constants.KEY_AUTHOR in rawConfig) {
    story.author = rawConfig[constants.KEY_AUTHOR];
  }

  if (constants.KEY_DESCRIPTION in rawConfig) {
    story.description = rawConfig[constants.KEY_DESCRIPTION];
  }

  if (constants.KEY_ENTITY in rawConfig) {
    story.rootEntity = rawConfig[constants.KEY_ENTITY];
  }
  
  return story;
}