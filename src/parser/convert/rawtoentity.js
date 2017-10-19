"use strict";

module.exports = {
  parse: parseEntities
};

async function parseEntities(rawStoryEntities) {

  let entities = [];

  // Iterate through each entity.
  for (let entityId in rawStoryEntities) {
    let entity = new Entity();

    // Load the name/path of the entity. This is defined by the
    // directory structure.
    let rawEntity = rawStoryEntities[entityId];
    entity.name = rawEntity.name;
    entity.path = rawEntity.path;

    // Translate the config from a representation created with a yaml
    // parser, a markdown parser, and a graphviz dot file parser into 
    // a useful internal representation.
    for (let rawEntityConfig of rawEntity.config) {
      entity.config = parseRawEntityConfig(entity.config, rawEntityConfig);
    }

    for (let rawEntityText of rawEntity.text) {
      entity.text = parseRawEntityText(entity.text, rawEntityText);
    }

    for (let rawEntityStates of rawEntity.states) {
      entity.states = parseRawEntityStates(entity.states, rawEntityStates);
    }

    // Append this now parsed entity to the list.
    entities.push(entity);
  }

  return entities;
}

function parseRawEntityStates(parsedStates, rawStates)
{
  for (let graph of rawStates.contents) {
    let stateName = graph.graph().id;
    parsedStates[stateName] = {};
    
    // Load all the possible state values.
    for (let stateValue of graph.nodes()) {
      parsedStates[stateName][stateValue] = [];
    }

    // Load all relationships each state value can have;
    // in other words, the list of acceptable states it
    // can transition to.
    for (let stateRelationship of graph.edges()) {
      parsedStates[stateName][stateRelationship.v].push(stateRelationship.w);

      // Relationships between states are one-way in
      // directed graphs, but two ways in undirected graphs.
      if (!graph.isDirected()) {
        parsedStates[stateName][stateRelationship.w].push(stateRelationship.v);
      }
    }

  }
  return parsedStates;
}

function parseRawEntityConfig(parsedConfig, rawConfig) {

  // The raw config is already in the desired format; merge it with
  // the master config.
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

class Entity {
  constructor() {
    this.name;
    this.path;
    this.config = {};
    this.text = {};
    this.states = {};
  }
}

