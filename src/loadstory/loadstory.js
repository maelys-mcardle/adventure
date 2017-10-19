"use strict";

const loadFiles = require('./loadfiles');
const fileToRaw = require('./convert/filetoraw');
const rawToStory = require('./convert/rawtostory');

module.exports = {
  load: loadStory
};

async function loadStory(storyDirectory) {

  // Load all the files in the specified directory in memory.
  let storyFiles = await loadFiles.load(storyDirectory);

  // Parse the file contents to an intermediary representation.
  let rawStory = await fileToRaw.parse(storyFiles);

  // Process the intermediary representation into the final story object.
  let story = await rawToStory.parse(rawStory);

  // Add run-time properties to the story object.

  return story;
}

loadStory('samples/simple').then(story => {
  console.log(story)
}).catch(reason => console.log(reason))