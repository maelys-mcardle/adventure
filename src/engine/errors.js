'use strict';

module.exports = {

  ACTION_UNDEFINED:
    (action, property) => `${action} for ${property} hasn't been defined.`,

  CHILD_ENTITY_NOT_FOUND: 
    (path) => `Child entity ${path} could not be found.`,

  DO_ACTION_INVALID: (action) => `Do action ${action} is invalid.`,

  DISABLED_VALUE_DOES_NOT_EXIST:
    (value, property) => 
      `Disabled value ${value} for ${property} does not exist.`,

  ENTITY_PROPERTY_NOT_FOUND: 
    (entity, property) => `Could not find ${entity} ${property}`,

  LISTING_FILE: (directory) => `Error listing file in ${directory}`,

  MAX_RECURSION: `Max recursion exceeded.`,

  NO_ENTITIES_IN_STORY: `Story has no entities specified.`,

  NO_PROPERTY_IN_CONFIG:
    (property) => `Could not find property ${property} of configs.`,

  NO_STORY_FOUND:
    (directory) => `No story was found in the directory "${directory}".`,

  NO_PROPERTY_FOR_TRIGGER:
    (property, trigger) => 
      `Could not find property ${property} for trigger ${trigger}`,

  NOT_FOUND: (object) => `${object} not found.`,

  RELATIONSHIP_NOT_DEFINED:
    (from, to) => `Relationship ${from} to ${tp} not defined.`,

  ROOT_ENTITY_UNDEFINED: `Root entity is not defined.`,

  TEMPLATE_AMBIGUOUS:
    (template, options) => 
      `${template} is ambiguous and can refer to: ${options}`,

  TRIGGER_NOT_FOUND:
    (trigger) => `Could not find ${trigger} to apply rule to.`,
  
  VALUE_DOES_NOT_EXIST:
    (value) => `Value ${value} does not exist.`,

  WORD_NOT_IN_TEMPLATE:
    (word, template) => `Word ${word} not found in template ${template}`,
}