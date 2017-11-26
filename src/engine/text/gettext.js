'use strict';

module.exports = {
  getAll: getStoryText,
  getDelta: getStoryDeltaText,
  getEntity: getEntityText,
  getEntityState: getEntityStateText,
}

const constants = require('../constants');

function getStoryText(story) {

  if (story.rootEntity == null) {
    console.log('Root entity is not defined.');
    return '';
  }

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
    console.log(contants.MAX_RECURSION_MESSAGE);
    return text;
  }

  for (let propertyName of Object.keys(oldEntity.properties)) {
    let oldState = oldEntity.properties[propertyName];
    let newState = newEntity.properties[propertyName]; 
    let oldValue = oldState.currentValue;
    let newValue = newState.currentValue;

    // Value changed. Describe everything.
    if (oldValue != newValue) {
      let stateTransitionText = getTransitionText(oldState, oldValue, newValue);
      let stateValueText = getEntityText(newEntity);
      text = text.
        concat(stateTransitionText).
        concat(stateValueText).
        filter(value => value != '');
    
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

function getTransitionText(state, fromValue, toValue) {
  return state.values[fromValue].relationships[toValue].text;
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
    console.log(contants.MAX_RECURSION_MESSAGE);
    return text;
  }

  for (let propertyName of Object.keys(entity.properties)) {
    let state = entity.properties[propertyName];
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
