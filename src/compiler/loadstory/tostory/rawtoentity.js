"use strict";

const pathToEntity = require('./pathtoentity');

module.exports = {
  parse: parseEntities
};

function parseEntities(rawStoryEntities, story) {

  let entities = [];
  
  // Iterate through each entity.
  for (let entityId in rawStoryEntities) {
    
    // Load the name/path of the entity. This is defined by the
    // directory structure.
    let rawEntity = rawStoryEntities[entityId];
    let entity = story.newEntity(rawEntity.name, rawEntity.path);

    // Translate the config from a representation created with a yaml
    // parser, a markdown parser, and a graphviz dot file parser into 
    // a useful internal representation.
    for (let rawEntityStates of rawEntity.states) {
      entity = parseRawEntityStates(entity, rawEntityStates);
    }

    for (let rawEntityText of rawEntity.text) {
      entity = parseRawEntityText(entity, rawEntityText);
    }

    for (let rawEntityConfig of rawEntity.config) {
      entity = parseRawEntityConfig(entity, story.actions, rawEntityConfig);
    }

    // Append this now parsed entity to the list.
    entities.push(entity);
  }

  // All entities loaded. Replace placeholders.
  entities = pathToEntity.entityPlaceholderToEntity(entities);

  // Load active entities into the current state.
  story = pathToEntity.loadCurrentStateEntities(story, entities);

  return story;
}

function parseRawEntityStates(entity, rawStates)
{
  for (let graph of rawStates.contents) {

    let stateName = graph.graph().id;
    let state = entity.newState(stateName);

    // Load all the possible state values.
    for (let stateValue of graph.nodes()) {
      state.addValue(state.newValue(stateValue));
    }

    // Load all relationships each state value can have;
    // in other words, the list of acceptable states it
    // can transition to.
    for (let stateRelationship of graph.edges()) {
      let fromStateValue = stateRelationship.v;
      let toStateValue = stateRelationship.w;

      state.values[fromStateValue].addRelationship(
        state.values[fromStateValue].newRelationship(toStateValue));

      // Relationships between states are one-way in
      // directed graphs, but two ways in undirected graphs.
      if (!graph.isDirected()) {
        state.values[toStateValue].addRelationship(
          state.values[toStateValue].newRelationship(fromStateValue));
      }
    }

    entity.addState(state);

  }
  return entity;
}

function parseRawEntityConfig(entity, actions, rawConfig) {

  for (let stateName of Object.keys(rawConfig.contents)) {
    if (stateName in entity.states) {

      let config = rawConfig.contents[stateName];
      let state = entity.states[stateName];

      state = loadConfigDefault(state, config);
      state = loadConfigActions(state, actions, config);
      state = loadConfigDisabled(state, config);
      state = loadConfigRules(state, config);
      state = loadConfigChildEntities(state, config);

      entity.states[stateName] = state;

    } else {
      console.log("Could not find state " + stateName + " of configs.");
    }
  }
  
  return entity;
}

function loadConfigDefault(state, config) {
  if ('initial' in config) {
    state.currentValue = config.initial;
  } else {
    console.log(state.name + " has no initial value specified in config.");
  }
  return state;
}

function loadConfigActions(state, actions, config) {
  if ('actions' in config) {
    for (let action of config.actions) {
      if (action in actions) {
        state.actions.push(action);
      } else {
        console.log(action + " for " + state.name + " hasn't been defined.");
      }
    }
  }
  return state;
}

function loadConfigDisabled(state, config) {
  if ('disable' in config) {
    for (let disabledStateValue of config.disable) {
      if (disabledStateValue in state.values) {
        state.values[disabledStateValue].disabled = true;
      } else {
        console.log("Disabled value " + disabledStateValue + " for " + state.name +
                    " does not exist.");
      }
    }
  }
  return state;
}

function loadConfigRules(state, config) {
  if ('rules' in config) {
    for (let rawTrigger of Object.keys(config.rules)) {
      let trigger = parseTrigger(rawTrigger);
      let ruleBlock = config.rules[rawTrigger];

      if (!Array.isArray(ruleBlock)) {
        console.log("Rules for " + rawTrigger + " are not an array.");
        continue;
      }

      if (!trigger.isTransition) {
        
        // For state.
        if (trigger.left in state.values) {
          state.values[trigger.left].rules = ruleBlock;
        } else {
          console.log("Could not find " + trigger.left + " to apply rule to.");
        }
  
      } else {

        state = setRelationshipValue(state, trigger, 'rules', ruleBlock);

      }
    }
  }

  return state;
}

function loadConfigChildEntities(state, config) {
  if ('entities' in config) {
    for (let parentStateValue of Object.keys(config.entities)) {
      for (let childEntityName of config.entities[parentStateValue]) {
        state.values[parentStateValue].childEntities.push(childEntityName);
      }
    }
  }
  return state;
}

function parseRawEntityText(entity, rawText) {

  let state;
  let trigger;
  let text;

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
        text = "";
      } else {
        trigger = headerText;
        text = "";
      }
    
    // Paragraph. 
    } else if (entryType === "para" && state && trigger) {
      text += '\n' + entry[1];
      entity = addTextToState(entity, state, trigger, text.trim());
    }
  }

  return entity;
}

function addTextToState(entity, stateName, rawTrigger, text) {

  if (!(stateName in entity.states)) {
    console.log('Could not find state ' + stateName + 
      ' for trigger ' + rawTrigger);
    return entity;
  }

  let state = entity.states[stateName];

  // Triggers have the format:
  //  left -- right (isTransition, isBidirectional)
  //  left -> right (isTransition, !isBidirectional)
  //  left          (!isTransition)
  let trigger = parseTrigger(rawTrigger);

  if (!trigger.isTransition) {

      // For state.
      if (trigger.left in state.values) {
        state.values[trigger.left].text = text;
        state.values[trigger.left].readableName = trigger.readableName;

      // For message.
      } else {
        state.messages[trigger.left] = text;
      }

  } else {

    state = setRelationshipValue(state, trigger, 'text', text);

  }

  entity.states[stateName] = state;
  return entity;
}


function setRelationshipValue(state, trigger, relationshipKey, relationshipValue) {
  
  // For unidirectional state transition (->).
  if (trigger.left in state.values &&
    trigger.right in state.values[trigger.left].relationships) {
      let relationship = state.values[trigger.left].relationships[trigger.right];
      relationship[relationshipKey] = relationshipValue;
      state.values[trigger.left].relationships[trigger.right] = relationship;
  } else {
    console.log('Relationship ' + trigger.left + ' to ' + trigger.right + ' not defined.');
  }

  // For bidirectional state transition (--).
  if (trigger.isBidirectional) {
    if (trigger.right in state.values &&
      trigger.left in state.values[trigger.right].relationships) {
        let relationship = state.values[trigger.right].relationships[trigger.left];
        relationship[relationshipKey] = relationshipValue;
        state.values[trigger.right].relationships[trigger.left] = relationship;
    } else {
      console.log('Relationship ' + trigger.right + ' to ' + 
        trigger.left + ' not defined.');
    }
  }

  return state;
}

function parseTrigger(trigger) {
  let left;
  let right;
  let isTransition = false;
  let isBidirectional = false;
  let readableName;

  // Triggers can be the following format:
  //    left -- right (from left to right, right to left)
  //    left -> right (from left to right)
  //    left (for only left)
  //    left: readableName

  if (trigger.includes('--')) {
    [left, right] = trigger.split('--').map(s => s.trim());
    isBidirectional = true;
    isTransition = true;
  } else if (trigger.includes('->')) {
    [left, right] = trigger.split('->').map(s => s.trim());
    isBidirectional = false;
    isTransition = true;
  } else {
    left = trigger;
  }

  if (left.includes(':')) {
    [left, readableName] = left.split(':').map(s => s.trim());
  } else {
    readableName = left;
  }

  return {
    left: left,
    right: right,
    isTransition: isTransition,
    isBidirectional: isBidirectional,
    readableName: readableName
  }
}

