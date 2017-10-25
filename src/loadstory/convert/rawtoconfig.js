"use strict";

module.exports = {
  parse: parseConfig
};

async function parseConfig(rawConfig, story) {

  // Append this now parsed entity to the list.
  let config = story.newConfig(rawConfig.name);

  story.setConfig(config);
  
  return story;
}