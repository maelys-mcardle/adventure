'use strict';

const getText = require('./text/gettext');
const eligibleInputs = require('./input/eligibleinputs');
const matchInput = require('./input/matchinput');
const applyAction = require('./applyaction');
const strings = require('../strings');

module.exports = {
  evaluateInput: evaluateInput,
  getOutput: getOutput,
  getAllInputs: getAllInputs,
  getInputExamples: getInputExamples
}

/**
 * Processes raw user input, updates the story accordingly, and returns
 * the text to output back to the user.
 * 
 * @param {Story} story The story object.
 * @param {string} input The raw user input.
 * @returns {[Story, string[]]} The updated story and text output.
 */
function evaluateInput(story, input) {
  let output = [strings.INPUT_UNRECOGNIZED];
  let inputMatch = matchInput.match(story, input);

  if (inputMatch.hasMatch) {

    [story, output] = applyAction.apply(story, 
      inputMatch.match.action,
      inputMatch.match.target,
      inputMatch.match.value);
    
    if (!inputMatch.isExactMatch) {
      output.unshift(strings.INPUT_UNDERSTOOD_AS(inputMatch.match.text));
    }

  } else if (inputMatch.hasSuggestion) {
    output = [strings.INPUT_SUGGESTION(inputMatch.suggestion)];
  }

  return [story, output];
}

/**
 * Gets the text for the story in its current state.
 * @param {Story} story The story object.
 * @returns {string[]} The paragraphs of text.
 */
function getOutput(story) {
  let output = getText.getAll(story);
  return output;
}

/**
 * Gets a list of example inputs for the user.
 * @param {Story} story The story object.
 * @returns {string[]} Examples of eligible commands.
 */
function getInputExamples(story) {
  let inputExamples = eligibleInputs.listExamples(story);
  let inputExamplesText = inputExamples.map(example => example.text);
  return inputExamplesText;
}

/**
 * Gets a list of all eligible inputs
 * @param {Story} story The story object.
 * @returns {string[]} All eligible commands.
 */
function getAllInputs(story) {
  let inputs = eligibleInputs.listAll(story);
  let inputsText = inputs.map(example => example.text);
  return inputsText;
}
