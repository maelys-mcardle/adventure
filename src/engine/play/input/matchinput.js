'use strict';

const stringSimilarity = require('string-similarity');
const removeDiacritics = require('diacritics').remove;
const eligibleInputs = require('./eligibleinputs');
const {MatchingInput} = require('./matchclass');
const constants = require('../../constants');

module.exports = {
  match: matchInput
}

/**
 * Matches user input to an action.
 * @param {Story} story The story object.
 * @param {string} input The raw user input.
 * @returns {MatchingInput} Information about any match.
 */
function matchInput(story, input) {

  let matchingInput = new MatchingInput();
  let allEligibleInputs = eligibleInputs.listAll(story, input);

  if (allEligibleInputs.length == 0) {
    return matchingInput;
  }

  let bestMatch = 
    stringSimilarity.findBestMatch(
      normalizeString(input),
      allEligibleInputs.map(i => normalizeString(i.text))).bestMatch;

  for (let eligibleInput of allEligibleInputs) {
    if (bestMatch.target === normalizeString(eligibleInput.text)) {

      if (bestMatch.rating >= constants.RATING_MATCH) {
        matchingInput.match = eligibleInput;
        matchingInput.hasMatch = true;
        matchingInput.isExactMatch = bestMatch.rating === 1.0;
      } else if (bestMatch.rating >= constants.RATING_SUGGESTION) {
        matchingInput.suggestion = eligibleInput.text;
        matchingInput.hasSuggestion = true;
      }

      break;
    }
  }

  return matchingInput;
}

/**
 * Removes punctuation from text.
 * @param {string} text The text to remove the punctuation.
 * @returns {string} The text with punctuation removed.
 */
function normalizeString(text) {
  return removeDiacritics(text // Remove diacritics from characters
    .replace(/[\W_]+/g," ")    // Replace non-aphanumeric characters with spaces
    .replace(/ +(?= )/g,'')    // Replace multiple spaces with single space
    .trim()
    .toLowerCase());
}