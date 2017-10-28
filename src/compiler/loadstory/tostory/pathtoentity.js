"use strict";

module.exports = {
  entityPlaceholderToEntity: entityPlaceholderToEntity,
  loadCurrentStateEntities: loadCurrentStateEntities
};

function loadCurrentStateEntities(story, entities) {

  if (story.currentState.length === 0) {
    console.log("Story has no entities specified.");
  }

  // Iterate over every active entity.
  for (let entityIndex in story.currentState) {
    let placeholder = story.currentState[entityIndex];
    let entity = getEntityFromPath(entities, placeholder);
    story.currentState[entityIndex] = entity;
  }

  return story;
}

function entityPlaceholderToEntity(entities) {

  // Single pass only.
  // At this point, child entities cannot contain children.

  // Iterate over every entity.
  for (let entityIndex in entities) {
    let entity = entities[entityIndex];

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
            let childEntity = getEntityFromPath(entities, placeholder);
            stateValue.childEntities[childIndex] = childEntity;
          }
        }
        state.values[stateValueName] = stateValue;
      }
      entity.states[stateName] = state;
    }
    entities[entityIndex] = entity;
  }

  return entities;
}

function getEntityFromPath(entities, path) {
  let splitPath = path.split('.');

  if (splitPath.length > 0 ) {
   
    let searchName = splitPath.pop();
    let searchPath = splitPath.join('.');

    for (let entity of entities) {
      if (searchName == entity.name &&
          searchPath == entity.path) {
        return entity;
      }
    }
  }

  console.log('Child entity ' + path + ' could not be found.');
  return path;
}