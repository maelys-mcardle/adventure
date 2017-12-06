'use strict';

const pathToEntity = require('./pathtoentity');
const constants = require('../../constants');
const errors = require('../../errors');

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
    for (let rawEntityProperties of rawEntity.properties) {
      entity = parseRawEntityProperties(entity, rawEntityProperties);
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

  // Load active entities into the current property.
  story = pathToEntity.loadCurrentPropertyEntities(story, entities);

  return story;
}

function parseRawEntityProperties(entity, rawProperties)
{
  for (let graph of rawProperties.contents) {

    let propertyName = graph.graph().id;
    let property = entity.newProperty(propertyName);

    // Load all the possible property values.
    for (let propertyValue of graph.nodes()) {
      property.addValue(property.newValue(propertyValue));
    }

    // Load all relationships each property value can have;
    // in other words, the list of acceptable properties it
    // can transition to.
    for (let relationship of graph.edges()) {
      let fromPropertyValue = relationship.v;
      let toPropertyValue = relationship.w;

      property.values[fromPropertyValue].addRelationship(
        property.values[fromPropertyValue].newRelationship(
          toPropertyValue));

      // Relationships between properties are one-way in
      // directed graphs, but two ways in undirected graphs.
      if (!graph.isDirected()) {
        property.values[toPropertyValue].addRelationship(
          property.values[toPropertyValue].newRelationship(
            fromPropertyValue));
      }
    }

    entity.addProperty(property);
  }

  return entity;
}

function parseRawEntityConfig(entity, actions, rawConfig) {

  for (let propertyName of Object.keys(rawConfig.contents)) {
    if (propertyName in entity.properties) {

      let config = rawConfig.contents[propertyName];
      let property = entity.properties[propertyName];

      property = loadConfigCurrentValue(property, config);
      property = loadConfigActions(property, actions, config);
      property = loadConfigDisabled(property, config);
      property = loadConfigRules(property, config);
      property = loadConfigChildEntities(property, config);

      entity.properties[propertyName] = property;

    } else {
      console.log(errors.NO_PROPERTY_IN_CONFIG(propertyName));
    }
  }
  
  return entity;
}

function loadConfigCurrentValue(property, config) {
  if (constants.CONFIG_VALUE in config) {
    property.currentValue = config[constants.CONFIG_VALUE];
  } else {
    console.log(errors.NO_VALUE_IN_CONFIG(property.name));
  }
  return property;
}

function loadConfigActions(property, actions, config) {
  if (constants.CONFIG_ACTIONS in config) {
    for (let action of config[constants.CONFIG_ACTIONS]) {
      if (action in actions) {
        property.actions.push(action);
      } else {
        console.log(errors.ACTION_UNDEFINED(action, property.name));
      }
    }
  }
  return property;
}

function loadConfigDisabled(property, config) {
  if (constants.CONFIG_DISABLE in config) {
    for (let disabledPropertyValue of config[constants.CONFIG_DISABLE]) {
      if (disabledPropertyValue in property.values) {
        property.values[disabledPropertyValue].disabled = true;
      } else {
        console.log(errors.DISABLED_VALUE_DOES_NOT_EXIST(
          disabledPropertyValue, property.name));
      }
    }
  }
  return property;
}

function loadConfigRules(property, config) {
  if (constants.CONFIG_RULES in config) {
    for (let rawTrigger of Object.keys(config[constants.CONFIG_RULES])) {
      let trigger = parseTrigger(rawTrigger);
      let triggerRules = config.rules[rawTrigger];

      if (!trigger.isTransition) {
        
        // For property.
        if (trigger.left in property.values) {
          property.values[trigger.left].rules = triggerRules;
        } else {
          console.log(errors.TRIGGER_NOT_FOUND(trigger.left));
        }
  
      } else {

        property = setRelationshipValue(property, trigger, 'rules', triggerRules);

      }
    }
  }

  return property;
}

function loadConfigChildEntities(property, config) {
  if (constants.CONFIG_ENTITIES in config) {
    let entityNames = Object.keys(config[constants.CONFIG_ENTITIES]);
    for (let parentPropertyValue of entityNames) {
      for (let childEntityName of config.entities[parentPropertyValue]) {
        property.values[parentPropertyValue].childEntities.push(childEntityName);
      }
    }
  }
  return property;
}

function parseRawEntityText(entity, rawText) {

  let property;
  let trigger;
  let text;

  // The markdown parser provides an array of items. The first is the
  // string 'markdown'.
  if (rawText.contents.length === 0 || 
      rawText.contents[0] !== constants.MD_MARKDOWN) {
    return parsedText;
  }

  // Go through all the items in the array provided by the
  // markdown parser. These are the headers and paragraphs.
  for (let entry of rawText.contents.slice(1)) {

    let entryType = entry[0];

    // Header.
    if (entryType === constants.MD_HEADER) {
      let headerLevel = entry[1].level;
      let headerText = entry[2];
      
      if (entry[1].level === 1) {
        property = headerText;
        text = '';
      } else {
        trigger = headerText;
        text = '';
      }
    
    // Paragraph. 
    } else if (entryType === constants.MD_PARAGRAPH && property && trigger) {
      text += '\n' + entry[1];
      entity = addTextToProperty(entity, property, trigger, text.trim());
    }
  }

  return entity;
}

function addTextToProperty(entity, propertyName, rawTrigger, text) {

  if (!(propertyName in entity.properties)) {
    console.log(errors.NO_PROPERTY_FOR_TRIGGER(propertyName, rawTrigger));
    return entity;
  }

  let property = entity.properties[propertyName];

  // Triggers have the format:
  //  left -- right (isTransition, isBidirectional)
  //  left -> right (isTransition, !isBidirectional)
  //  left          (!isTransition)
  let trigger = parseTrigger(rawTrigger);

  if (!trigger.isTransition) {

      // For property.
      if (trigger.left in property.values) {
        property.values[trigger.left].text = text;
        property.values[trigger.left].readableName = trigger.readableName;

      // For message.
      } else {
        property.messages[trigger.left] = text;
      }

  } else {

    property = setRelationshipValue(property, trigger, 'text', text);

  }

  entity.properties[propertyName] = property;
  return entity;
}


function setRelationshipValue(property, trigger, relationshipKey, relationshipValue) {
  
  // For unidirectional property transition (->).
  if (trigger.left in property.values &&
    trigger.right in property.values[trigger.left].relationships) {
      let relationship = property.values[trigger.left].relationships[trigger.right];
      relationship[relationshipKey] = relationshipValue;
      property.values[trigger.left].relationships[trigger.right] = relationship;
  } else {
    console.log(errors.RELATIONSHIP_NOT_DEFINED(trigger.left, trigger.right));
  }

  // For bidirectional property transition (--).
  if (trigger.isBidirectional) {
    if (trigger.right in property.values &&
      trigger.left in property.values[trigger.right].relationships) {
        let relationship = property.values[trigger.right].relationships[trigger.left];
        relationship[relationshipKey] = relationshipValue;
        property.values[trigger.right].relationships[trigger.left] = relationship;
    } else {
      console.log(errors.RELATIONSHIP_NOT_DEFINED(trigger.right, trigger.left));
    }
  }

  return property;
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

