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

  return story;
}

function addPropertiesToStory(story) {

  for (let entityId in story.entities) {

    let entity = story.entities[entityId];
    entity.currentState = {};

    for (let stateName in entity.states) {

      // Use the default state as the initial current state if
      // specified.
      if ("default" in entity.config[stateName]) {
        entity.currentState[stateName] = entity.config[stateName].default;

      // If no default first state is specified, go for the first
      // state value.
      } else {
        let stateValues = Object.keys(entity.states[stateName]);

        if (stateValues.length > 0) {
          entity.currentState[stateName] = stateValues[0];
        } else {
          entity.currentState[stateName] = undefined;
        }
      }

    }
    
  }

  return story;
}

loadStory('samples/simple').then(story => {
  console.log(story)
}).catch(reason => console.log(reason))