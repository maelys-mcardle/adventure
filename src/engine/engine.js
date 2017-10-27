"use strict";

const loadStory = require('../compiler/loadstory/loadstory');

// Initial state.
// Action to change state. Actions relative to current state.

// Parse rules for state transition.
// Rules might change state.

// Compare state with initial state.
// Print messages for state values that have changed.


loadStory.loadJson('samples/simple').then(story => {
  console.log(story);
}).catch(errorReason => console.log(errorReason));