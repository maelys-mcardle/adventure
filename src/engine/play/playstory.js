'use strict';

const getText = require('./text/gettext');
const eligibleActions = require('./actions/eligibleactions');
const executeActions = require('./actions/executeactions');
const strings = require('../strings');

module.exports = {
  evaluateInput: evaluateInput,
  describeCurrentState: describeCurrentState,
  listActionExamples: listActionExamples
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

function describeCurrentState(story) {
  let output = getText.getAll(story);
  return output;
}

function listActionExamples(story) {
  let output = eligibleActions.listExamples(story);
  return output;
}
