const loadFiles = require('./loadfiles');
const fileToRaw = require('./filetoraw');
const rawToStory = require('./jstostory');

async function loadStory(storyDirectory) {

  // Load all the files in the specified directory in memory.
  let storyFiles = await loadFiles.load(storyDirectory);

  // Parse the file contents to an intermediary representation.
  let rawStory = await fileToRaw.parse(storyFiles);

  // Parse the javascript objects to the story objects.
  let story = await rawToStory.parse(rawStory);

  return story;
}

loadStory('samples/simple').then(story => {
  console.log(story)
}).catch(reason => console.log(reason))