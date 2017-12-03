'use strict';

module.exports = {
  MAX_RECURSION: `Max recursion exceeded.`,
  LISTING_FILE: (directory) => `Error listing file in ${directory}`,
  NO_ENTITIES_IN_STORY: `Story has no entities specified.`,
  CHILD_ENTITY_NOT_FOUND: 
    (path) => `Child entity ${path} could not be found.`,
  WORD_NOT_IN_TEMPLATE:
    (word, template) => `Word ${word} not found in template ${template}`,
  NO_PROPERTY_IN_CONFIG:
    (property) => `Could not find property ${property} of configs.`,
  NO_VALUE_IN_CONFIG:
    (property) => `${property} has no initial value specified in config.`,
  ACTION_UNDEFINED:
    (action, property) => `${action} for ${property} hasn't been defined.`,
  DISABLED_VALUE_DOES_NOT_EXIST:
    (value, property) => 
      `Disabled value ${vaue} for ${property} does not exist.`,
  TRIGGER_NOT_FOUND:
    (trigger) => `Could not find ${trigger} to apply rule to.`,
  NO_PROPERTY_FOR_TRIGGER:
    (property, trigger) => 
      `Could not find property ${property} for trigger ${trigger}`,
  RELATIONSHIP_NOT_DEFINED:
    (from, to) => `Relationship ${from} to ${tp} not defined.`,
  TEMPLATE_AMBIGUOUS:
    (template, options) => 
      `${template} is ambiguous and can refer to: ${options}`,
  ROOT_ENTITY_UNDEFINED: `Root entity is not defined.`,
  ENTITY_PROPERTY_NOT_FOUND: 
    (entity, property) => `Could not find ${entity} ${property}`,
  NOT_FOUND: (object) => `${object} not found.`,
}