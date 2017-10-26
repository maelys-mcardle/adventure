"use strict";

const loadFiles = require('./tofile/loadfiles');
const fileToRaw = require('./toraw/filetoraw');
const rawToStory = require('./tostory/rawtostory');

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

  return story;
}

loadStory('samples/simple').then(story => {
  console.log(JSON.stringify(story))
}).catch(reason => console.log(reason))