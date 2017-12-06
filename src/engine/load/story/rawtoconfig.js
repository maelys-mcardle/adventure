'use strict';

const constants = require('../../constants');

module.exports = {
  parse: parseConfig
};

function parseConfig(rawConfig, story) {

  if (constants.CONFIG_TITLE in rawConfig) {
    story.title = rawConfig[constants.CONFIG_TITLE];
  }

  if (constants.CONFIG_AUTHOR in rawConfig) {
    story.author = rawConfig[constants.CONFIG_AUTHOR];
  }

  if (constants.CONFIG_DESCRIPTION in rawConfig) {
    story.description = rawConfig[constants.CONFIG_DESCRIPTION];
  }

  if (constants.CONFIG_ENTITY in rawConfig) {
    story.rootEntity = rawConfig[constants.CONFIG_ENTITY];
  }
  
  return story;
}