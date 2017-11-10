'use strict';

const executeRules = require('../rules/executerules');
const getEntity = require('../entities/getentity');
const describeState = require('../text/describestate');

module.exports = {
  execute: executeAction,
}

function executeAction(story, actionName, 
  entityName, entityPath, stateName, newStateValueName) {

  let action = story.actions[actionName];

  if (action.changesStateValue) { 
    return executeStateChangeAction(story, action, 
      entityName, entityPath, stateName, newStateValueName);
  }

  if (action.describesEntityState) {
    return executeDescribeAction(story, entityName, entityPath, stateName);
  }

  return [story, ''];
}

function executeDescribeAction(story, entityName, entityPath, stateName) {

  // Get entity.
  let entityState = 
    getEntity.findState(story, entityName, entityPath, stateName);

  if (entityState == null) {
    return [story, ''];
  }

  // Print the description.
  let paragraphs = describeState.getEntityState(entityState);

  // Concatenate the output.
  let output = paragraphs.join('\n\n');
  
  return [story, output];
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
    executeRules.before(
      updatedStory, 
      action, 
      entityName, entityPath,
      stateName, newStateValueName);

  // Print the current delta.
  let paragraphs = describeState.getDelta(initialStory, updatedStory);

  // Apply rules for when in state.
  [updatedStory, stateMessages] = executeRules.after(
    updatedStory, 
    action, 
    entityName, entityPath,
    stateName);

  // Concatenate the output.
  let output = 
    transitionMessages.
      concat(paragraphs).
      concat(stateMessages).
      join('\n\n');
  
  return [updatedStory, output];
}

function createCopy(object) {
  return JSON.parse(JSON.stringify(object));
}
