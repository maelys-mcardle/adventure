"use strict";

const eligibleActions = require('./actions/eligibleactions');
const describeState = require('./text/describestate');
const executeRules = require('./rules/executerules');
const getEntity = require('./entities/getentity');

module.exports = {
  evaluateInput: evaluateInput,
  describeCurrentState: describeCurrentState,
  listActionExamples: listActionExamples
}

function describeCurrentState(story) {
  let output = describeState.getAll(story).join('\n\n');
  return output;
}

function listActionExamples(story) {
  let output = eligibleActions.listExamples(story);
  return output;
}

function evaluateInput(story, input) {
  let output = 'Command not recognized.';
  let inputMatch = eligibleActions.matchInput(story, input);

  if (inputMatch.hasMatch) {

    [story, output] = executeAction(story, 
      inputMatch.match.actionName,
      inputMatch.match.entityName,
      inputMatch.match.entityPath,
      inputMatch.match.stateName,
      inputMatch.match.stateValueName);
    
    if (!inputMatch.isExactMatch) {
      output = 'Understood "' + inputMatch.match.text + '"\n\n' + output;
    }

  } else if (inputMatch.hasSuggestion) {
    output = 'Did you mean "' + inputMatch.suggestion + '"?';
  }

  return [story, output];
}

function executeAction(story, actionName, 
  entityName, entityPath, stateName, newStateValueName) {

  let action = story.actions[actionName];

  if (action.doesStateChange) { 
    return executeStateChangeAction(story, action, 
      entityName, entityPath, stateName, newStateValueName);
  }

  if (action.doesDescribeEntity) {
    return executeDescribeAction(story, entityName, entityPath);
  }

  return [story, ''];
}

function executeDescribeAction(story, entityName, entityPath) {

  // Get entity.
  let entity = getEntity.find(story, entityName, entityPath);

  if (entity == null) {
    return [story, ''];
  }

  // Print the description.
  let paragraphs = describeState.getEntity(entity, 0);

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
