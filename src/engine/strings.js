'use strict';

module.exports = {
  INPUT_UNRECOGNIZED: `That can't be done.`,
  INPUT_UNDERSTOOD_AS: (command) => `Understood "${command}"`,
  INPUT_SUGGESTION: (suggestion) => `Did you mean "${suggestion}"?`,

  ERROR_MAX_RECURSION: `Max recursion exceeded.`,
}