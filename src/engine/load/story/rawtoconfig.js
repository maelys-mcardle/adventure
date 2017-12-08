'use strict';

const constants = require('../../constants');

module.exports = {
  parse: parseConfig
};

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