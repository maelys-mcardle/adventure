'use strict';

const placeholders = require('./placeholders');
const {Trigger} = require('./triggerclass');
const constants = require('../../../constants');
const errors = require('../../../errors');

module.exports = {
  parse: parseEntities
};

/**
 * Parses entities from their intermediate representation into their final.
 * @param {RawEntity[]} rawStoryEntities The raw entities.
 * @param {Story} story The story object.
 * @returns {Story} The updated story object.
 */
function parseEntities(rawStoryEntities, story) {

  let entities = [];
  
  // Iterate through each entity.
  for (let entityId in rawStoryEntities) {
    
    // Load the name/path of the entity. This is defined by the
    // directory structure.
    let rawEntity = rawStoryEntities[entityId];
    let entity = story.newEntity(rawEntity.name, rawEntity.path);

    // Translate the entity data from objects created with a yaml
    // parser, a markdown parser, and a graphviz dot file parser into 
    // a useful internal representation.
    for (let parsedDotFile of rawEntity[constants.TYPE_DOT]) {
      entity = parseDot(entity, parsedDotFile);
    }

    for (let parsedMarkdown of rawEntity[constants.TYPE_MARKDOWN]) {
      entity = parseMarkdown(entity, parsedMarkdown);
    }

    for (let parsedYaml of rawEntity[constants.TYPE_YAML]) {
      entity = parseYaml(entity, story.actions, parsedYaml);
    }

    // Append this now parsed entity to the list.
    entities.push(entity);
  }

  // All entities loaded. Replace placeholders.
  entities = placeholders.replacePlaceholders(story, entities);

  return story;
}

/**
 * Parses a Dot file associated with the entity.
 * This populates all the values for the property.
 * @param {Entity} entity The entity.
 * @param {Object} rawDot A parsed Dot file for the entity.
 * @returns {Entity} The updated entity.
 */
function parseDot(entity, rawDot)
{
  for (let graph of rawDot.contents) {

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

/**
 * Parses a Markdown file associated with the entity.
 * This populates the text for the entity.
 * @param {Entity} entity The entity.
 * @param {Object} rawMarkdown A parsed Markdown file for the entity.
 * @returns {Entity} The updated entity.
 */
function parseMarkdown(entity, rawMarkdown) {

  let property;
  let trigger;
  let text;

  // The markdown parser provides an array of items. The first is the
  // string 'markdown'.
  if (rawMarkdown.contents.length === 0 || 
    rawMarkdown.contents[0] !== constants.MD_MARKDOWN) {
    return parsedText;
  }

  // Go through all the items in the array provided by the
  // markdown parser. These are the headers and paragraphs.
  for (let entry of rawMarkdown.contents.slice(1)) {

    let entryType = entry[0];

    // Header.
    if (entryType === constants.MD_HEADER) {
      let headerLevel = entry[1].level;
      let headerText = entry[2];
      
      if (entry[1].level === 1) {
        property = headerText;
        text = [];
      } else {
        trigger = headerText;
        text = [];
      }
    
    // Paragraph. 
    } else if (entryType === constants.MD_PARAGRAPH && property && trigger) {
      let paragraph = entry[1];
      text.push(paragraph);
      entity = addTextToProperty(entity, property, trigger, text);
    }
  }

  return entity;
}

/**
 * Parses a Yaml file associated with the entity.
 * This defines all behaviour for the entity.
 * @param {Entity} entity The entity.
 * @param {Actions[]} actions The actions for the story.
 * @param {Object} rawYaml A parsed Yaml file for the entity.
 * @returns {Entity} The updated entity.
 */
function parseYaml(entity, actions, rawYaml) {

  for (let propertyName of Object.keys(rawYaml.contents)) {
    if (propertyName in entity.properties) {

      let config = rawYaml.contents[propertyName];
      let property = entity.properties[propertyName];

      property = loadCurrentValue(property, config);
      property = loadActions(property, actions, config);
      property = loadDisabled(property, config);
      property = loadRules(property, config);
      property = loadChildEntities(property, config);

      entity.properties[propertyName] = property;

    } else {
      console.log(errors.NO_PROPERTY_IN_CONFIG(propertyName));
    }
  }
  
  return entity;
}

/**
 * Load current value for the property.
 * @param {Property} property The property.
 * @param {Object} config Property configuration.
 * @returns {Property} The updated property.
 */
function loadCurrentValue(property, config) {
  if (constants.KEY_VALUE in config) {
    property.currentValue = config[constants.KEY_VALUE];
  } else {
    console.log(errors.NO_VALUE_IN_CONFIG(property.name));
  }
  return property;
}

/**
 * Load actions for the property.
 * @param {Property} property The property.
 * @param {Actions[]} actions All the actions.
 * @param {Object} config Property configuration.
 * @returns {Property} The updated property.
 */
function loadActions(property, actions, config) {
  if (constants.KEY_ACTIONS in config) {
    for (let action of config[constants.KEY_ACTIONS]) {
      if (action in actions) {
        property.actions.push(action);
      } else {
        console.log(errors.ACTION_UNDEFINED(action, property.name));
      }
    }
  }
  return property;
}

/**
 * Load disabled values for the property.
 * @param {Property} property The property.
 * @param {Object} config Property configuration.
 * @returns {Property} The updated property.
 */
function loadDisabled(property, config) {
  if (constants.KEY_DISABLE in config) {
    for (let disabledPropertyValue of config[constants.KEY_DISABLE]) {
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

/**
 * Load rules for the property.
 * @param {Property} property The property.
 * @param {Object} config Property configuration.
 * @returns {Property} The updated property.
 */
function loadRules(property, config) {
  if (constants.KEY_RULES in config) {
    for (let rawTrigger of Object.keys(config[constants.KEY_RULES])) {
      let trigger = new Trigger(rawTrigger);
      let triggerRules = config.rules[rawTrigger];

      if (!trigger.isTransition) {
        
        // For property.
        if (trigger.left in property.values) {
          property.values[trigger.left].rules = triggerRules;
        } else {
          console.log(errors.TRIGGER_NOT_FOUND(trigger.left));
        }
  
      } else {

        property = addRelationshipData(property, trigger, 
          constants.KEY_RULES, triggerRules);

      }
    }
  }

  return property;
}

/**
 * Load placeholder for child entities.
 * @param {Property} property The property.
 * @param {Object} config Property configuration.
 * @returns {Property} The updated property.
 */
function loadChildEntities(property, config) {
  if (constants.KEY_ENTITIES in config) {
    let entityNames = Object.keys(config[constants.KEY_ENTITIES]);
    for (let parentValue of entityNames) {
      for (let childEntityName of config.entities[parentValue]) {
        property.values[parentValue].childEntities.push(childEntityName);
      }
    }
  }
  return property;
}

/**
 * Adds text to a property, either one of its values, or as a message.
 * @param {Entity} entity The entity.
 * @param {string} propertyName The values for the relationship.
 * @param {string} rawTrigger Where to put the text.
 * @param {string[]} text The text to store.
 * @returns {Entity} The updated entity.
 */
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
  let trigger = new Trigger(rawTrigger);

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

    property = addRelationshipData(property, trigger, 
      constants.KEY_TEXT, text);

  }

  entity.properties[propertyName] = property;
  return entity;
}

/**
 * Adds data (rules, text) to a relationship in a property.
 * @param {Property} property The property.
 * @param {Trigger} trigger The values for the relationship.
 * @param {string} key What to set for the relationship (eg. text, rules).
 * @param {string[]|Object} value The value to set.
 * @returns {Property} The updated property.
 */
function addRelationshipData(property, trigger, key, value) {
  
  // For unidirectional property transition (->).
  if (trigger.left in property.values &&
      trigger.right in property.values[trigger.left].relationships) {

    property.values[trigger.left].relationships[trigger.right][key] = value;

  } else {

    console.log(errors.RELATIONSHIP_NOT_DEFINED(trigger.left, trigger.right));

  }

  // For bidirectional property transition (--).
  if (trigger.isBidirectional) {
    if (trigger.right in property.values &&
        trigger.left in property.values[trigger.right].relationships) {

      property.values[trigger.right].relationships[trigger.left][key] = value;

    } else {

      console.log(errors.RELATIONSHIP_NOT_DEFINED(trigger.right, trigger.left));

    }
  }

  return property;
}
