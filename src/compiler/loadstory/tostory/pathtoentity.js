"use strict";

const constants = require('../../../constants');

module.exports = {
  entityPlaceholderToEntity: entityPlaceholderToEntity,
  loadCurrentStateEntities: loadCurrentStateEntities
};

function loadCurrentStateEntities(story, entities) {

  if (story.rootEntity == null) {
    console.log("Story has no entities specified.");
  }

  story.rootEntity = getEntityFromPath(entities, story.rootEntity);
  return story;
}

function entityPlaceholderToEntity(entities) {

  // Iterate over every entity.
  for (let entityIndex in entities) {
    let entity = entities[entityIndex];
    entity = updateEntityPlaceholders(entities, entity, 0);
    entities[entityIndex] = entity;
  }

  return entities;
}

function updateEntityPlaceholders(entities, entity, recursion) {
  
  if (recursion >= constants.MAX_RECURSION) {
    console.log('Max recursion exceeded.');
    return entity;
  }
      
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

          // child path is:
          //  parentPath.parentName.parentState.parentStateValue.childPath
          let childPath = 
            [entity.path, entity.name, stateName, stateValueName, 
              childEntity.path].filter(s => s != '').join('.');

          childEntity.path = childPath;
          childEntity = updateEntityPlaceholders(entities, 
            childEntity, recursion + 1);
          
          stateValue.childEntities[childIndex] = childEntity;
        }
      }
      state.values[stateValueName] = stateValue;
    }
    entity.states[stateName] = state;
  }
  
  return entity;
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
