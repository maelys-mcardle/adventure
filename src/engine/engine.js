'use strict';

const loadStory = require('./load/loadstory');
const playStory = require('./play/playstory');

module.exports = {
  loadStory: loadStory.load,
  evaluateInput: playStory.evaluateInput,
  getStoryOutput: playStory.getOutput,
  getInputExamples: playStory.getInputExamples,
  getAllInputs: playStory.getAllInputs
}
