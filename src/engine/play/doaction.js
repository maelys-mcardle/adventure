'use strict';

const executeRules = require('./rules/executerules');
const getEntity = require('./entities/getentity');
const getText = require('./text/gettext');

module.exports = {
  do: applyActionToProperty,
}

function applyActionToProperty(story, actionName, targetProperty, value) {

  let action = story.actions[actionName];
  let description = [];

  if (action.changesPropertyValue) { 
    return changeValue(story, action, targetProperty, value);
  }

  else if (action.describesEntityProperty) {
    description = describe(story, targetProperty);
  }

  return [story, description];
}

function describe(story, target) {

  let paragraphs = [];

  // Get entity property.
  let property = 
    getEntity.findProperty(story, target.entity, target.path, target.property);

  if (property == null) {
    return paragraphs;
  }

  // Print the description.
  paragraphs = getText.getProperty(property);
  return paragraphs;
}

function changeValue(initialStory, action, target, value) {

  let transitionMessages = [];
  let newValueMessages = [];
  
  // Copy story.
  let updatedStory = createCopy(initialStory);

  // Transition to new value:
  //  - set new value
  //  - apply rules for transition
  [updatedStory, transitionMessages] = 
    executeRules.execute(
      updatedStory, action, target.entity, target.path,
      target.property, value, true);

  // Print the current delta.
  let paragraphs = getText.getDelta(initialStory, updatedStory);

  // Apply rules for when in new value.
  [updatedStory, newValueMessages] = executeRules.execute(
    updatedStory, action, target.entity, target.path,
    target.property, null, false);

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
