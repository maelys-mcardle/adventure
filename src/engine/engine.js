"use strict";

const eligibleActions = require('./eligibleactions');
const describeState = require('./describestate');
const constants = require('./constants');

module.exports = {
  evaluateInput: evaluateInput,
  describeCurrentState: describeCurrentState
}

function describeCurrentState(story) {
  let output = describeState.getAll(story).join('\n\n');
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

function executeAction(initialStory, actionName, entityName, entityPath,
  stateName, newStateValueName) {

  let [updatedStory, messages] = executeRules(
    createCopy(initialStory), 
    actionName, 
    entityName, entityPath,
    stateName, newStateValueName);

  let paragraphs = describeState.getDelta(initialStory, updatedStory);
  let output = paragraphs.join('\n\n');
  
  return [updatedStory, output];
}

function executeRules(story, actionName, targetEntityName, 
    targetEntityPath, targetStateName, newStateValueName) {

  let messages = [];

  for (let entityIndex in story.currentState) {
    let entity = story.currentState[entityIndex];

    let entityState = 
      getEntityStateByName(entity, targetEntityName, targetEntityPath, 
        targetStateName, 0);
    
    if (entityState != null) {
      entityState.currentValue = newStateValueName;
      entity = updateEntityStateByName(entity, targetEntityName, 
        targetEntityPath, targetStateName, entityState, 0);
      story.currentState[entityIndex] = entity;
    }

  }

  // No rules. Change state.

  return [story, messages];
}

function getEntityStateByName(entity, targetEntityName, targetEntityPath, 
  targetStateName, recursion) {

  if (recursion >= constants.MAX_RECURSION) {
    console.log('Max recursion reached.');
    return null;
  }

  // current entity matches.
  if (entity.name == targetEntityName && entity.path == targetEntityPath) {
    return entity.states[targetStateName];
  
  // search children.
  } else {
    for (let stateName of Object.keys(entity.states)) {
      let state = entity.states[stateName];
      let currentStateValue = state.values[state.currentValue];
      for (let childEntity of currentStateValue.childEntities) {
        let childEntityState = getEntityStateByName(childEntity,
          targetEntityName, targetEntityPath, 
          targetStateName, recursion + 1);
        if (childEntityState != null) {
          return childEntityState;
        }
      }
    }
  }

  return null;
}

function updateEntityStateByName(entity, targetEntityName, targetEntityPath, 
  targetStateName, updatedState, recursion) {

  if (recursion >= constants.MAX_RECURSION) {
    console.log('Max recursion reached.');
    return entity;
  }

  // current entity matches.
  if (entity.name == targetEntityName && entity.path == targetEntityPath) {
    entity.states[targetStateName] = updatedState;
  
  // search children.
  } else {
    for (let stateName of Object.keys(entity.states)) {
      let state = entity.states[stateName];
      let currentStateValue = state.values[state.currentValue];
      for (let childEntityIndex in currentStateValue.childEntities) {
        let childEntity = currentStateValue.childEntities[childEntityIndex];
        
        let updatedChildEntity = updateEntityStateByName(childEntity,
          targetEntityName, targetEntityPath, 
          targetStateName, updatedState, recursion + 1);
        
        currentStateValue.childEntities[childEntityIndex] = updatedChildEntity;
      }
      entity.states[stateName].values[state.currentValue] = currentStateValue;
    }
  }

  return entity;
}

function textForStateDifference(initialStory, finalStory) {
  return '';
}

function createCopy(object) {
  return JSON.parse(JSON.stringify(object));
}

// Initial state.
// Action to change state. Actions relative to current state.

// Parse rules for state transition.
// Rules might change state. Otherwise proceed to final state.

// Compare state with initial state.
// Print messages for state values that have changed.
