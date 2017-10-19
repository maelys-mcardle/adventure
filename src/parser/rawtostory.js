"use strict";

module.exports = {
  parse: parseEntity
};

async function parseEntity(rawStory) {
  let story = new Story();

  for (let entityId in rawStory.entities) {
    let entity = new Entity();

    let rawEntity = rawStory.entities[entityId];
    entity.name = rawEntity.name;
    entity.path = rawEntity.path;

    for (let rawEntityConfig of rawEntity.config) {
      entity.config = parseRawEntityConfig(entity.config, rawEntityConfig);
    }

    for (let rawEntityText of rawEntity.text) {
      entity.text = parseRawEntityText(entity.text, rawEntityText);
    }

    story.entities.push(entity);
  }

  return story;
}

function parseRawEntityConfig(parsedConfig, rawConfig) {

  let mergedConfig = Object.assign({}, parsedConfig, rawConfig.contents);

  return mergedConfig;
}

function parseRawEntityText(parsedText, rawText) {

  let state;
  let trigger;

  // The markdown parser provides an array of items. The first is the
  // string "markdown".
  if (rawText.contents.length === 0 || 
      rawText.contents[0] !== "markdown") {
    return parsedText;
  }

  // Go through all the items in the array provided by the
  // markdown parser. These are the headers and paragraphs.
  for (let entry of rawText.contents.slice(1)) {

    let entryType = entry[0];

    // Header.
    if (entryType === "header") {
      let headerLevel = entry[1].level;
      let headerText = entry[2];
      
      if (entry[1].level === 1) {
        state = headerText;
        parsedText[state] = {};
      } else {
        trigger = headerText;
      }
    
    // Paragraph. 
    } else if (entryType === "para" && state && trigger) {
      let paragraphText = entry[1];

      // This is the second paragraph onward under the header.
      if (trigger in parsedText[state]) {
        parsedText[state][trigger] += '\n' + paragraphText;

      // This is the first paragraph under the header.
      } else {
        parsedText[state][trigger] = paragraphText;
      }
    }
  }

  return parsedText;
}

class Story {
  constructor() {
    this.entities = [];
  }
}

class Entity {
  constructor() {
    this.name;
    this.path;
    this.config = {};
    this.text = {};
    this.states = {};
  }
}

