'use strict';

const loadFiles = require('./file/loadfiles');
const fileToRaw = require('./raw/filetoraw');
const rawToStory = require('./story/rawtostory');
const constants = require('../constants');
const errors = require('../errors');

module.exports = {
  load: loadStory
};

/**
 * Loads a story in a directory and creates its story object.
 * @param {string} storyDirectory The file path to the story directory.
 * @returns {Story} The story object.
 */
function loadStory(storyDirectory) {

  // Load all the files in the specified directory in memory.
  let storyFiles = loadFiles.load(storyDirectory);

  // Parse the file contents to an intermediary representation.
  let rawStory = fileToRaw.parse(storyFiles);

  // Show an error message if the story files are an unsupported version.
  if (rawStory.version > constants.STORY_FILES_VERSION) {
    console.log(errors.VERSION_TOO_NEW);
  }

  // If a story was found, proceed.
  if (rawStory.foundStory) {

    // Process the intermediary representation into the final story object.
    let story = rawToStory.parse(rawStory);

    return story;
  }
  
  // No story found. Produce error.
  console.log(errors.NO_STORY_FOUND(storyDirectory));

  return null;
}
