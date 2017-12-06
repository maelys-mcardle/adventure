'use strict';

const stringSimilarity = require('string-similarity');
const eligibleInputs = require('./eligibleinputs');
const {MatchingInput} = require('./matchclass');

module.exports = {
  match: matchInput
}

/** Matches user input to an action. */
function matchInput(story, input) {

  let matchingInput = new MatchingInput();
  let allEligibleInputs = eligibleInputs.listAll(story, input);

  let bestMatch = stringSimilarity.findBestMatch(input.trim(),
    allEligibleInputs.map(i => i.text)).bestMatch;

  if (bestMatch.rating > 0.9) {
    for (let eligibleInput of allEligibleInputs) {
      if (bestMatch.target === eligibleInput.text) {
        matchingInput.match = eligibleInput;
        matchingInput.hasMatch = true;
        matchingInput.isExactMatch = bestMatch.rating === 1.0;
        break;
      }
    }
  } else if (bestMatch.rating > 0.5) {
    matchingInput.suggestion = bestMatch.target;
    matchingInput.hasSuggestion = true;
  }

  return matchingInput;
}
