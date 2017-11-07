'use strict';

module.exports = {
  getDelta: getStateDeltaText,
  getEntity: getAllEntityText,
  getAll: getAllStateText
}

const constants = require('../constants');

function getAllStateText(story) {
  let text = [];

  for (let entityIndex in story.currentState) {
    let entity = story.currentState[entityIndex];
    text = text.concat(getAllEntityText(entity, 0));
  }

  return text;
}

function getStateDeltaText(oldStory, newStory) {
  let text = [];

  for (let entityIndex in oldStory.currentState) {
    let oldEntity = oldStory.currentState[entityIndex];
    let newEntity = newStory.currentState[entityIndex];
    let entityText = getEntityDeltaText(oldEntity, newEntity, 0);
    text = text.concat(entityText);
  }

  return text;
}

function getEntityDeltaText(oldEntity, newEntity, recursion) {
  let text = [];
  
  if (recursion >= constants.MAX_RECURSION) {
    console.log('Maximum recursion depth exceeded.');
    return text;
  }

  for (let stateName of Object.keys(oldEntity.states)) {
    let oldState = oldEntity.states[stateName];
    let newState = newEntity.states[stateName]; 
    let oldValue = oldState.currentValue;
    let newValue = newState.currentValue;

    // Value changed. Describe everything.
    if (oldValue != newValue) {
      let stateValueText = getAllEntityText(newEntity, 0);
      text = text.concat(stateValueText);
    
    // Value same. See if child changed.
    } else {
      for (let childIndex in newState.values[newValue].childEntities) {
        let oldChild = oldState.values[oldValue].childEntities[childIndex];
        let newChild = newState.values[newValue].childEntities[childIndex];
        let childText = getEntityDeltaText(oldChild, newChild, recursion + 1);
        text = text.concat(childText);
      }
    }
  }

  return text;
}

function getAllEntityText(entity, recursion) {
  let text = [];

  if (recursion >= constants.MAX_RECURSION) {
    console.log('Maximum recursion depth exceeded.');
    return text;
  }

  for (let stateName of Object.keys(entity.states)) {
    let state = entity.states[stateName];
    let value = state.currentValue;

    let stateValueText = state.values[value].text;
    text.push(stateValueText);

    for (let childEntity of state.values[value].childEntities) {
      let childEntityText = getAllEntityText(childEntity, recursion + 1);
      text = text.concat(childEntityText);
    }

  }

  return text;
}
