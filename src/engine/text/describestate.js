'use strict';

module.exports = {
  getAll: getStoryText,
  getDelta: getStoryDeltaText,
  getEntity: getEntityText,
  getEntityState: getEntityStateText,
}

const constants = require('../../constants');

function getStoryText(story) {
  let text = getEntityText(story.rootEntity, 0);
  return text;
}

function getStoryDeltaText(oldStory, newStory) {

  let oldEntity = oldStory.rootEntity;
  let newEntity = newStory.rootEntity;
  let text = getEntityDeltaText(oldEntity, newEntity, 0);
  
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
      let stateValueText = getEntityText(newEntity);
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

function getEntityText(entity) {
  return getEntityTextRecursive(entity, 0);
}

function getEntityStateText(state) {
  return getEntityStateTextRecursive(state, 0);
}

function getEntityTextRecursive(entity, recursion) {
  let text = [];

  if (recursion >= constants.MAX_RECURSION) {
    console.log('Maximum recursion depth exceeded.');
    return text;
  }

  for (let stateName of Object.keys(entity.states)) {
    let state = entity.states[stateName];
    let stateText = getEntityStateTextRecursive(state, recursion);
    text = text.concat(stateText);
  }

  return text;
}

function getEntityStateTextRecursive(state, recursion) {
  let text = [];

  let value = state.currentValue;

  let stateValueText = state.values[value].text;
  text.push(stateValueText);

  for (let childEntity of state.values[value].childEntities) {
    let childEntityText = getEntityTextRecursive(childEntity, recursion + 1);
    text = text.concat(childEntityText);
  }

  return text;
}
