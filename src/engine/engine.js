'use strict';

const loadStory = require('./load/loadstory');
const getText = require('./run/text/gettext');
const eligibleActions = require('./run/actions/eligibleactions');
const executeActions = require('./run/actions/executeactions');
const strings = require('./strings');

module.exports = {
  loadStory: loadStory.load,
  evaluateInput: evaluateInput,
  describeCurrentState: describeCurrentState,
  listActionExamples: listActionExamples
}

function describeCurrentState(story) {
  let output = getText.getAll(story);
  return output;
}

function listActionExamples(story) {
  let output = eligibleActions.listExamples(story);
  return output;
}

function evaluateInput(story, input) {
  let output = [strings.INPUT_UNRECOGNIZED];
  let inputMatch = eligibleActions.matchInput(story, input);

  if (inputMatch.hasMatch) {

    [story, output] = executeActions.execute(story, 
      inputMatch.match.actionName,
      inputMatch.match.entityName,
      inputMatch.match.entityPath,
      inputMatch.match.propertyName,
      inputMatch.match.propertyValueName);
    
    if (!inputMatch.isExactMatch) {
      output.unshift(strings.INPUT_UNDERSTOOD_AS(inputMatch.match.text));
    }

  } else if (inputMatch.hasSuggestion) {
    output = [strings.INPUT_SUGGESTION(inputMatch.suggestion)];
  }

  return [story, output];
}
