'use strict';

const constants = require('../constants');

module.exports = {
  find: findEntity,
  findState: findEntityState,
}

function findEntity(story, targetEntityName, targetEntityPath) {

  let foundEntity = getEntityByName(story.rootEntity, 
    targetEntityName, targetEntityPath);

  return foundEntity;
}

function findEntityState(story, targetEntityName, targetEntityPath, 
  targetStateName) {

  let entityState = getEntityStateByName(story.rootEntity, 
    targetEntityName, targetEntityPath, targetStateName);

  return entityState;
}

function getEntityStateByName(rootEntity, targetEntityName, targetEntityPath, 
  targetStateName) {

  let entity = 
    getEntityByName(rootEntity, targetEntityName, targetEntityPath, 0);
  
  if (entity != null) {
    return entity.states[targetStateName];
  }

  return null;
}

function getEntityByName(entity, targetEntityName, targetEntityPath,
   recursion) {

  if (recursion >= constants.MAX_RECURSION) {
    console.log(contants.MAX_RECURSION_MESSAGE);
    return null;
  }

  // current entity matches.
  if (entity.name == targetEntityName && entity.path == targetEntityPath) {
    return entity;

  // search children.
  } else {
    for (let stateName of Object.keys(entity.states)) {
      let state = entity.states[stateName];
      let currentStateValue = state.values[state.currentValue];
      for (let childEntity of currentStateValue.childEntities) {
        let foundEntity = getEntityByName(childEntity,
          targetEntityName, targetEntityPath, recursion + 1);
        if (foundEntity != null) {
          return foundEntity;
        }
      }
    }
  }

  return null;
}
