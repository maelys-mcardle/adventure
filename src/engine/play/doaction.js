'use strict';

const executeRules = require('./rules/executerules');
const getEntity = require('./entities/getentity');
const getText = require('./text/gettext');

module.exports = {
  do: applyActionToProperty,
}

function applyActionToProperty(story, actionName, entityName, entityPath, 
    propertyName, newPropertyValueName) {

  let action = story.actions[actionName];
  let description = [];

  if (action.changesPropertyValue) { 
    return changeValue(story, action, entityName, entityPath, 
      propertyName, newPropertyValueName);
  }

  else if (action.describesEntityProperty) {
    description = describe(story, entityName, entityPath, propertyName);
  }

  return [story, description];
}

function describe(story, entityName, entityPath, propertyName) {

  let paragraphs = [];

  // Get entity property.
  let property = 
    getEntity.findProperty(story, entityName, entityPath, propertyName);

  if (property == null) {
    return paragraphs;
  }

  // Print the description.
  paragraphs = getText.getEntityProperty(property);
  return paragraphs;
}

function changeValue(initialStory, action, 
  entityName, entityPath, propertyName, newPropertyValueName) {

  let transitionMessages = [];
  let newValueMessages = [];
  
  // Copy story.
  let updatedStory = createCopy(initialStory);

  // Transition to new value:
  //  - set new value
  //  - apply rules for transition
  [updatedStory, transitionMessages] = 
    executeRules.execute(
      updatedStory, action, entityName, entityPath,
      propertyName, newPropertyValueName, true);

  // Print the current delta.
  let paragraphs = getText.getDelta(initialStory, updatedStory);

  // Apply rules for when in new value.
  [updatedStory, newValueMessages] = executeRules.execute(
    updatedStory, action, entityName, entityPath,
    propertyName, null, false);

  // Concatenate the output.
  let output = 
    transitionMessages.
      concat(paragraphs).
      concat(newValueMessages);
  
  return [updatedStory, output];
}

function createCopy(object) {
  return JSON.parse(JSON.stringify(object));
}
