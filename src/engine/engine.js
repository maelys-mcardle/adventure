"use strict";

const eligibleActions = require('./actions/eligibleactions');
const describeState = require('./text/describestate');
const executeRules = require('./rules/executeall');

module.exports = {
  evaluateInput: evaluateInput,
  describeCurrentState: describeCurrentState,
  listActionExamples: listActionExamples
}

function describeCurrentState(story) {
  let output = describeState.getAll(story).join('\n\n');
  return output;
}

function listActionExamples(story) {
  let output = eligibleActions.listExamples(story);
  return output;
}

function evaluateInput(story, input) {
  let output = 'Command not recognized.';
  let inputMatch = eligibleActions.matchInput(story, input);

  if (inputMatch.hasMatch) {

    [story, output] = executeAction(story, 
      inputMatch.match.actionName,
      inputMatch.match.entityName,
      inputMatch.match.entityPath,
      inputMatch.match.stateName,
      inputMatch.match.stateValueName);
    
    if (!inputMatch.isExactMatch) {
      output = 'Understood "' + inputMatch.match.text + '"\n\n' + output;
    }

  } else if (inputMatch.hasSuggestion) {
    output = 'Did you mean "' + inputMatch.suggestion + '"?';
  }

  return [story, output];
}

function executeAction(initialStory, actionName, entityName, entityPath,
  stateName, newStateValueName) {

  let [updatedStory, messages] = executeRules.execute(
    createCopy(initialStory), 
    actionName, 
    entityName, entityPath,
    stateName, newStateValueName);

  let paragraphs = describeState.getDelta(initialStory, updatedStory);
  let output = paragraphs.join('\n\n');
  
  return [updatedStory, output];
}

function createCopy(object) {
  return JSON.parse(JSON.stringify(object));
}
