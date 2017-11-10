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

  if ('entity' in rawConfig) {
    story.rootEntity = rawConfig.entity;
  }
  
  return story;
}