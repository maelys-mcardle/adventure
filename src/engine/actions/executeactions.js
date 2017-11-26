'use strict';

const executeRules = require('../rules/executerules');
const getEntity = require('../entities/getentity');
const getText = require('../text/gettext');

module.exports = {
  execute: executeAction,
}

function executeAction(story, actionName, 
  entityName, entityPath, stateName, newStateValueName) {

  let action = story.actions[actionName];
  let description = [];

  if (action.changesStateValue) { 
    return executeStateChangeAction(story, action, 
      entityName, entityPath, stateName, newStateValueName);
  }

  else if (action.describesEntityState) {
    description = 
      executeDescribeAction(story, entityName, entityPath, stateName);
  }

  return [story, description];
}

function executeDescribeAction(story, entityName, entityPath, stateName) {

  let paragraphs = [];

  // Get entity.
  let entityState = 
    getEntity.findState(story, entityName, entityPath, stateName);

  if (entityState == null) {
    return paragraphs;
  }

  // Print the description.
  paragraphs = getText.getEntityState(entityState);
  return paragraphs;
}

function executeStateChangeAction(initialStory, action, 
  entityName, entityPath, stateName, newStateValueName) {

  let transitionMessages = [];
  let stateMessages = [];
  
  // Copy story.
  let updatedStory = createCopy(initialStory);

  // Transition to new state:
  //  - set new state
  //  - apply rules for transition
  [updatedStory, transitionMessages] = 
    executeRules.execute(
      updatedStory, action, entityName, entityPath,
      stateName, newStateValueName, true);

  // Print the current delta.
  let paragraphs = getText.getDelta(initialStory, updatedStory);

  // Apply rules for when in state.
  [updatedStory, stateMessages] = executeRules.execute(
    updatedStory, action, entityName, entityPath,
    stateName, null, false);

  // Concatenate the output.
  let output = 
    transitionMessages.
      concat(paragraphs).
      concat(stateMessages);
  
  return [updatedStory, output];
}

function createCopy(object) {
  return JSON.parse(JSON.stringify(object));
}
