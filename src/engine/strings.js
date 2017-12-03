'use strict';

module.exports = {
  INPUT_UNRECOGNIZED: `That can't be done.`,
  INPUT_UNDERSTOOD_AS: (command) => `Understood "${command}"`,
  INPUT_SUGGESTION: (suggestion) => `Did you mean "${suggestion}"?`,

  ERROR_MAX_RECURSION: `Max recursion exceeded.`,
  ERROR_LISTING_FILE: (directory) => `Error listing file in ${directory}`,
  ERROR_NO_ENTITIES_IN_STORY: `Story has no entities specified.`,
  ERROR_CHILD_ENTITY_NOT_FOUND: 
    (path) => `Child entity ${path} could not be found.`,
  ERROR_WORD_NOT_IN_TEMPLATE:
    (word, template) => `Word ${word} not found in template ${template}`,
  ERROR_NO_PROPERTY_IN_CONFIG:
    (property) => `Could not find property ${property} of configs.`,
  ERROR_NO_VALUE_IN_CONFIG:
    (property) => `${property} has no initial value specified in config.`,
  ERROR_ACTION_UNDEFINED:
    (action, property) => `${action} for ${property} hasn't been defined.`,
  ERROR_DISABLED_VALUE_DOES_NOT_EXIST:
    (value, property) => 
      `Disabled value ${vaue} for ${property} does not exist.`,
  ERROR_TRIGGER_NOT_FOUND:
    (trigger) => `Could not find ${trigger} to apply rule to.`,
  ERROR_NO_PROPERTY_FOR_TRIGGER:
    (property, trigger) => 
      `Could not find property ${property} for trigger ${trigger}`,
  ERROR_RELATIONSHIP_NOT_DEFINED:
    (from, to) => `Relationship ${from} to ${tp} not defined.`,
  ERROR_TEMPLATE_AMBIGUOUS:
    (template, options) => 
      `${template} is ambiguous and can refer to: ${options}`,
  ERROR_ROOT_ENTITY_UNDEFINED: `Root entity is not defined.`,
  ERROR_ENTITY_PROPERTY_NOT_FOUND: 
    (entity, property) => `Could not find ${entity} ${property}`,
  ERROR_NOT_FOUND: (object) => `${object} not found.`,
  
  
}