const loadFiles = require('./loadfiles');
const fileToRaw = require('./filetoraw');
const rawToEntity = require('./rawtoentity');

async function loadStory(storyDirectory) {

  // Load all the files in the specified directory in memory.
  let storyFiles = await loadFiles.load(storyDirectory);

  // Parse the file contents to an intermediary representation.
  let rawStory = await fileToRaw.parse(storyFiles);

  // Process the intermediary representation into the final story
  // object.
  let story = new Story();  
  story.entities = await rawToEntity.parse(rawStory.entities);

  return story;
}

class Story {
  constructor() {
    this.entities = [];
  }
}

loadStory('samples/simple').then(story => {
  console.log(story)
}).catch(reason => console.log(reason))