'use strict';

const constants = require('../../constants');

module.exports = {
  updateState: updateEntityState,
}

function updateEntityState(story, targetEntityName, targetEntityPath, 
  targetStateName, updatedState) {

  story.rootEntity = 
    updateEntityStateByName(
      story.rootEntity, targetEntityName, targetEntityPath, 
      targetStateName, updatedState, 0);

  return story;
}

function updateEntityStateByName(entity, targetEntityName, targetEntityPath, 
targetStateName, updatedState, recursion) {

  if (recursion >= constants.MAX_RECURSION) {
    console.log('Max recursion reached.');
    return entity;
  }

  // current entity matches.
  if (entity.name == targetEntityName && entity.path == targetEntityPath) {
    entity.states[targetStateName] = updatedState;

  // search children.
  } else {
    for (let stateName of Object.keys(entity.states)) {
      let state = entity.states[stateName];
      let currentStateValue = state.values[state.currentValue];
      for (let childEntityIndex in currentStateValue.childEntities) {
        let childEntity = currentStateValue.childEntities[childEntityIndex];
        
        let updatedChildEntity = updateEntityStateByName(childEntity,
          targetEntityName, targetEntityPath, 
          targetStateName, updatedState, recursion + 1);
        
        currentStateValue.childEntities[childEntityIndex] = updatedChildEntity;
      }
      entity.states[stateName].values[state.currentValue] = currentStateValue;
    }
  }

  return entity;
}