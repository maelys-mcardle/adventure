"use strict";

module.exports = {
  parse: parseConfig
};

async function parseConfig(rawConfig, story) {

  if ('title' in rawConfig) {
    story.title = rawConfig.title;
  }

  if ('author' in rawConfig) {
    story.author = rawConfig.author;
  }

  if ('entities' in rawConfig) {
    for (let entityName of rawConfig.entities) {
      story.addActiveEntity(entityName);
    }
  }
  
  return story;
}