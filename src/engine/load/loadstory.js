'use strict';

const loadFiles = require('./file/loadfiles');
const fileToRaw = require('./raw/filetoraw');
const rawToStory = require('./story/rawtostory');

module.exports = {
  load: loadStory
};

function loadStory(storyDirectory) {

  // Load all the files in the specified directory in memory.
  let storyFiles = loadFiles.load(storyDirectory);

  // Parse the file contents to an intermediary representation.
  let rawStory = fileToRaw.parse(storyFiles);

  // Process the intermediary representation into the final story object.
  let story = rawToStory.parse(rawStory);

  return story;
}
