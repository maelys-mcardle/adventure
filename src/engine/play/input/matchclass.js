'use strict';

/** This class tracks the results of searching eligible inputs. */
class MatchingInput {
  constructor() {
    this.match;
    this.hasMatch = false;
    this.isExactMatch = false;
    this.hasSuggestion = false;
    this.suggestion = '';
  }
}

exports.MatchingInput = MatchingInput;