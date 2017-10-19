const loadFiles = require('./convert/loadfiles');
const fileToRaw = require('./convert/filetoraw');
const rawToEntity = require('./convert/rawtoentity');
const rawToAction = require('./convert/rawtoaction');

async function loadStory(storyDirectory) {

  // Load all the files in the specified directory in memory.
  let storyFiles = await loadFiles.load(storyDirectory);

  // Parse the file contents to an intermediary representation.
  let rawStory = await fileToRaw.parse(storyFiles);

  // Process the intermediary representation into the final story object.
  let story = rawToStory(rawStory);

  return story;
}

async function rawToStory(rawStory) {
  let story = new Story();
  story.config = rawStory.config;
  story.entities = await rawToEntity.parse(rawStory.entities);
  story.actions = await rawToAction.parse(rawStory.actions);

  return story;
}

class Story {
  constructor() {
    this.name;
    this.config = {};
    this.entities = [];
    this.actions = [];
  }
}

loadStory('samples/simple').then(story => {
  console.log(story)
}).catch(reason => console.log(reason))