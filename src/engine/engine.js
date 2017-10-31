"use strict";

const eligibleActions = require('./eligibleactions');
const describeState = require('./describestate');

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

function executeRules(story, actionName, entityName, 
    entityPath, stateName, newStateValueName) {

  let messages = [];

  for (let entityIndex in story.currentState) {
    let entity = story.currentState[entityIndex];
    if (entity.name == entityName && entity.path == entityPath) {
      entity.states[stateName].currentValue = newStateValueName;
    }
    story.currentState[entityIndex] = entity;
  }

  // No rules. Change state.

  return [story, messages];
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
