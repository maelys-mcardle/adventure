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

    for (let rawEntityText of rawEntity.text) {
      entity.text.push(parseRawText(rawEntityText));
    }

    story.entities.push(entity);
  }

  return story;
}

function parseRawText(rawText) {

  let stateText = new StateText();
  stateText.name = rawText.name;

  let key;

  // The markdown parser provides an array of items. The first is the
  // string "markdown".
  if (rawText.contents.length === 0 || 
      rawText.contents[0] !== "markdown") {
    return stateText;
  }

  // Go through all the items in the array provided by the
  // markdown parser. These are the headers and paragraphs.
  for (let entry of rawText.contents.slice(1)) {

    let entryType = entry[0];

    // Header.
    if (entryType === "header") {
      let headerLevel = entry[1].level;
      let headerText = entry[2];
      key = headerText;
    
    // Paragraph. 
    } else if (entryType === "para" && key) {
      let paragraphText = entry[1];

      // This is the second paragraph onward under the header.
      if (key in stateText.text) {
        stateText.text[key] += '\n' + paragraphText;

      // This is the first paragraph under the header.
      } else {
        stateText.text[key] = paragraphText;
      }
    }
  }

  return stateText;
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
    this.config;
    this.text = [];
  }
}

class EntityConfig {
  constructor() {

  }
}

class StateText {
  constructor() {
    this.state;
    this.text = {};
  }
}
