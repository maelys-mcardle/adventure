'use strict';

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