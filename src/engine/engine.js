"use strict";

const loadStory = require('../compiler/loadstory/loadstory');
const eligibleActions = require('./eligibleactions');

async function processAction(story, entity, state, newStateValue) {
  let initialState = story;
  let currentState = createCopy(story);

  return currentState;
}

function parseInput(story, input) {
  let possibleActions = eligibleActions.list(story.actions, story.currentState);

  return possibleActions;
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

async function test(directory) {
  let story = await loadStory.load(directory);
  let newState = parseInput(story, "go north");
  return newState;
}

test('samples/simple').then(output => {
  console.log(output);
}).catch(errorReason => console.log(errorReason));