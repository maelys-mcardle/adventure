'use strict';

const getText = require('./text/gettext');
const eligibleInputs = require('./input/eligibleinputs');
const matchInput = require('./input/matchinput');
const executeAction = require('./action/executeaction');
const strings = require('../strings');

module.exports = {
  evaluateInput: evaluateInput,
  describeCurrentState: describeCurrentState,
  listInputExamples: listInputExamples
}

function evaluateInput(story, input) {
  let output = [strings.INPUT_UNRECOGNIZED];
  let inputMatch = matchInput.match(story, input);

  if (inputMatch.hasMatch) {

    [story, output] = executeAction.execute(story, 
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

function listInputExamples(story) {
  let output = eligibleInputs.listExamples(story);
  return output;
}
