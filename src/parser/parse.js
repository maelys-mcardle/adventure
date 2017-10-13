const loadFiles = require('./loadfiles');
const fileToJs = require('./filetojs');
const jsToStory = require('./jstostory');

async function loadStory(storyDirectory) {

  // Load all the files in the specified directory in memory.
  let storyFiles = await loadFiles.load(storyDirectory);

  // Parse the file contents as JavaScript objects.
  // This is an intermediary representation.
  let jsObject = await fileToJs.parse(storyFiles);

  // Parse the javascript objects to the story objects.

  return jsObject;
}

loadStory('samples/simple').then(story => {
  console.log(story)
}).catch(reason => console.log(reason))