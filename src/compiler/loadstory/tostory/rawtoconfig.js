"use strict";

module.exports = {
  parse: parseConfig
};

function parseConfig(rawConfig, story) {

  if ('title' in rawConfig) {
    story.title = rawConfig.title;
  }

  if ('author' in rawConfig) {
    story.author = rawConfig.author;
  }

  if ('entities' in rawConfig) {
    for (let entityName of rawConfig.entities) {
      story.addCurrentState(entityName);
    }
  }
  
  return story;
}