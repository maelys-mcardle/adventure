"use strict";

const eligibleActions = require('./eligibleactions');

module.exports = {
  evaluateInput: evaluateInput
}

function evaluateInput(story, input) {
  let output = 'Command not recognized.';
  let inputMatch = eligibleActions.matchInput(story, input);

  if (inputMatch.hasMatch) {

    [story, output] = processAction(story, 
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

function processAction(story, actionName, entityName, entityPath,
  stateName, newStateValueName) {

  let updatedStory = createCopy(story);

  updatedStory = executeRules(updatedStory, actionName, entityName, entityPath,
    stateName, newStateValueName);

  return [updatedStory, ''];
}

function executeRules(story, actionName, entityName, 
    entityPath, stateName, newStateValueName) {

  for (let entityIndex in story.currentState) {
    let entity = story.currentState[entityIndex];
    if (entity.name == entityName && entity.path == entityPath) {
      entity.states[stateName].currentValue = newStateValueName;
    }
    story.currentState[entityIndex] = entity;
  }

  // No rules. Change state.

  return story;
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
