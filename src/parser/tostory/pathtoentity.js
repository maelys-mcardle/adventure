"use strict";

module.exports = {
  replacePlaceholdersWithEntities: replacePlaceholdersWithEntities
};

async function replacePlaceholdersWithEntities(story) {
  story = entityPlaceholderToEntity(story);
  story = currentStatePlaceholderToEntity(story);
  return story;
}

function currentStatePlaceholderToEntity(story) {

  if (story.currentState.length === 0) {
    console.log("Story has no entities specified.");
  }

  // Iterate over every active entity.
  for (let entityIndex in story.currentState) {
    let placeholder = story.currentState[entityIndex];
    let entity = getEntityFromPath(story, placeholder);
    story.currentState[entityIndex] = entity;
  }

  return story;
}

function entityPlaceholderToEntity(story) {

  // Single pass only.
  // At this point, child entities cannot contain children.

  // Iterate over every entity.
  for (let entityIndex in story.entities) {
    let entity = story.entities[entityIndex];

    // Iterate over every entity's state.
    for (let stateName of Object.keys(entity.states)) {
      let state = entity.states[stateName];

      // Iterate over every entity's state values.
      for (let stateValueName of Object.keys(state.values)) {
        let stateValue = state.values[stateValueName];

        // Iterate over all child entities in the state values.
        for (let childIndex in stateValue.childEntities) {
          let placeholder = stateValue.childEntities[childIndex];
          if (typeof(placeholder) === 'string') {
            let childEntity = getEntityFromPath(story, placeholder);
            stateValue.childEntities[childIndex] = childEntity;
          }
        }
        state.values[stateValueName] = stateValue;
      }
      entity.states[stateName] = state;
    }
    story.entities[entityIndex] = entity;
  }

  return story;
}

function getEntityFromPath(story, path) {
  let splitPath = path.split('.');

  if (splitPath.length > 0 ) {
   
    let searchName = splitPath.pop();
    let searchPath = splitPath.join('.');

    for (let entity of story.entities) {
      if (searchName == entity.name &&
          searchPath == entity.path) {
        return entity;
      }
    }
  }

  console.log('Child entity ' + path + ' could not be found.');
  return path;
}
