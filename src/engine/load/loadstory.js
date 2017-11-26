'use strict';

const loadFiles = require('./tofile/loadfiles');
const fileToRaw = require('./toraw/filetoraw');
const rawToStory = require('./tostory/rawtostory');

module.exports = {
  load: loadStory,
  loadJson: loadStoryAsJson
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

function loadStoryAsJson(directory) {

  // Load the story.
  let story = loadStory(directory);

  // Serialize the story.
  let storyAsJson = JSON.stringify(story, null, 2);

  return storyAsJson;
}
