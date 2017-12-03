'use strict';

const loadStory = require('./load/loadstory');
const runStory = require('./run/runstory');

module.exports = {
  loadStory: loadStory.load,
  evaluateInput: runStory.evaluateInput,
  describeCurrentState: runStory.describeCurrentState,
  listActionExamples: runStory.listActionExamples
}
