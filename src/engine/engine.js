"use strict";

const eligibleActions = require('./eligibleactions');

module.exports = {
  evaluateInput: evaluateInput
}

function processAction(story, entity, state, newStateValue) {
  let initialState = story;
  let currentState = createCopy(story);

  return currentState;
}

function evaluateInput(story, input) {
  let possibleActions = eligibleActions.list(story.actions, story.currentState);
  let output = "story action";

  return story, output;
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
