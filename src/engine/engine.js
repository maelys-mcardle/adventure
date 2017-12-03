'use strict';

const loadStory = require('./load/loadstory');
const playStory = require('./play/playstory');

module.exports = {
  loadStory: loadStory.load,
  evaluateInput: playStory.evaluateInput,
  describeCurrentState: playStory.describeCurrentState,
  listActionExamples: playStory.listActionExamples
}
