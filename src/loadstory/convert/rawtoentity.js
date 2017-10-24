"use strict";

module.exports = {
  parse: parseEntities
};

async function parseEntities(rawStoryEntities, actions) {

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
    for (let rawEntityStates of rawEntity.states) {
      entity = parseRawEntityStates(entity, rawEntityStates);
    }

    for (let rawEntityText of rawEntity.text) {
      entity = parseRawEntityText(entity, rawEntityText);
    }

    for (let rawEntityConfig of rawEntity.config) {
      entity = parseRawEntityConfig(entity, actions, rawEntityConfig);
    }

    // Append this now parsed entity to the list.
    entities.push(entity);
  }

  return entities;
}

function parseRawEntityStates(entity, rawStates)
{
  for (let graph of rawStates.contents) {
    let entityState = new EntityState();

    let stateName = graph.graph().id;
    entityState.name = stateName;

    // Load all the possible state values.
    for (let stateValue of graph.nodes()) {
      entityState.values[stateValue] = new EntityStateValue();
      entityState.values[stateValue].name = stateValue;
    }

    // Load all relationships each state value can have;
    // in other words, the list of acceptable states it
    // can transition to.
    for (let stateRelationship of graph.edges()) {
      let fromState = stateRelationship.v;
      let toState = stateRelationship.w;
      let toRelationship = new EntityStateRelationship();

      toRelationship.toState = toState;
      entityState.values[fromState].relationships[toState] = toRelationship;

      // Relationships between states are one-way in
      // directed graphs, but two ways in undirected graphs.
      if (!graph.isDirected()) {
        let fromRelationship = new EntityStateRelationship();
        fromRelationship.toState = fromState;
        entityState.values[toState].relationships[fromState] = fromRelationship;
      }
    }

    entity.states[stateName] = entityState;

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

      entity.states[stateName] = state;

    } else {
      console.log("Could not find state " + stateName + " of configs.");
    }
  }
  
  return entity;
}

function loadConfigDefault(state, config) {
  if ('default' in config) {
    state.defaultValue = config.default;
    state.currentValue = config.default;
  } else {
    console.log(state.name + " has no default value specified in config.");
  }
  return state;
}

function loadConfigActions(state, actions, config) {
  if ('actions' in config) {
    for (let action of config.actions) {
      if (actions.map(a => a.name).includes(action)) {
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

function addTextToState(entity, state, trigger, text) {

  if (!(state in entity.states)) {
    console.log('Could not find state ' + state + ' for trigger ' + trigger);
    return entity;
  }

  let entityState = entity.states[state];
  let fromStateValue;
  let toStateValue;
  let forStateValueOrMessage;
  let isStateTransition = false;
  let isBidirectional = false;

  // Triggers can be the following format:
  //    from_state -- to_state
  //    from_state -> to_state
  //    for_state
  //    for_message
  if (trigger.includes('--')) {
    [fromStateValue, toStateValue] = trigger.split('--').map(s => normalizeName(s));
    isBidirectional = true;
    isStateTransition = true;
  } else if (trigger.includes('->')) {
    [fromStateValue, toStateValue] = trigger.split('->').map(s => normalizeName(s));
    isBidirectional = false;
    isStateTransition = true;
  } else {
    forStateValueOrMessage = normalizeName(trigger);
  }

  if (!isStateTransition) {

      // For state.
      if (forStateValueOrMessage in entityState.values) {
        entityState.values[forStateValueOrMessage].text = text;

      // For message.
      } else {
        entityState.messages[forStateValueOrMessage] = text;
      }

  } else {

    // For unidirectional state transition (->).
    if (fromStateValue in entityState.values &&
        toStateValue in entityState.values[fromStateValue].relationships) {
        entityState.values[fromStateValue].relationships[toStateValue].text = text;
    } else {
      console.log('Text for non-existant state ' + fromStateValue + 
                  ' or ' + toStateValue + ': ' + text);
    }

    // For bidirectional state transition (--).
    if (isBidirectional) {
      if (toStateValue in entityState.values &&
        fromStateValue in entityState.values[toStateValue].relationships) {
        entityState.values[toStateValue].relationships[fromStateValue].text = text;
      } else {
        console.log('Text for non-existant state ' + fromStateValue + 
                    ' or ' + toStateValue + ': ' + text); 
      }
    }
  }

  entity.states[state] = entityState;
  return entity;
}

function normalizeName(string) {
  // Trim, replace space with underscores.
  return string.trim().toLowerCase().replace(/ /g, '_');
}

class Entity {
  constructor() {
    this.name;
    this.path;
    this.states = {};
  }
}

class EntityState {
  constructor() {
    this.name;
    this.messages = {};
    this.values = {};
    this.actions = [];
    this.defaultValue;
    this.currentValue;
  }
}

class EntityStateValue {
  constructor() {
    this.name;
    this.text;
    this.disabled = false;
    this.relationships = {};
    this.childEntities = [];
    this.rules = [];
  }
}

class EntityStateRelationship {
  constructor() {
    this.toState;
    this.text;
    this.rules = [];
  }
}

class EntityRule {
  constructor() {
    this.steps = [];
  }
}