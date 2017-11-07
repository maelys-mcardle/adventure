'use strict';

const constants = require('./constants');

module.exports = {
  execute: executeRules
}

function executeRules(story, actionName, targetEntityName, 
  targetEntityPath, targetStateName, newStateValueName) {

let messages = [];

for (let entityIndex in story.currentState) {
  let entity = story.currentState[entityIndex];

  let entityState = 
    getEntityStateByName(entity, targetEntityName, targetEntityPath, 
      targetStateName, 0);
  
  if (entityState != null) {
    entityState.currentValue = newStateValueName;
    entity = updateEntityStateByName(entity, targetEntityName, 
      targetEntityPath, targetStateName, entityState, 0);
    story.currentState[entityIndex] = entity;
  }

}

// No rules. Change state.

return [story, messages];
}

function getEntityStateByName(entity, targetEntityName, targetEntityPath, 
targetStateName, recursion) {

if (recursion >= constants.MAX_RECURSION) {
  console.log('Max recursion reached.');
  return null;
}

// current entity matches.
if (entity.name == targetEntityName && entity.path == targetEntityPath) {
  return entity.states[targetStateName];

// search children.
} else {
  for (let stateName of Object.keys(entity.states)) {
    let state = entity.states[stateName];
    let currentStateValue = state.values[state.currentValue];
    for (let childEntity of currentStateValue.childEntities) {
      let childEntityState = getEntityStateByName(childEntity,
        targetEntityName, targetEntityPath, 
        targetStateName, recursion + 1);
      if (childEntityState != null) {
        return childEntityState;
      }
    }
  }
}

return null;
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