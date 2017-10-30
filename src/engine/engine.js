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
      inputMatch.match.action,
      inputMatch.match.entity,
      inputMatch.match.state,
      inputMatch.match.stateValue);
    
    if (!inputMatch.isExactMatch) {
      output = 'Understood "' + inputMatch.match.text + '"\n\n' + output;
    }

  } else if (inputMatch.hasSuggestion) {
    output = 'Did you mean "' + inputMatch.suggestion + '"?';
  }

  return [story, output];
}

function processAction(story, action, entity, state, newStateValue) {
  let initialState = story;
  let currentState = createCopy(story);

  return currentState;
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
