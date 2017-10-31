'use strict';

module.exports = {
  getDelta: getStateDeltaText,
  getEntity: getAllEntityText,
  getAll: getAllStateText
}

const constants = require('./constants');

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

    for (let stateName of Object.keys(oldEntity.states)) {
      let oldValue = oldEntity.states[stateName].currentValue;
      let newValue = newEntity.states[stateName].currentValue;

      if (oldValue != newValue) {
        let stateValueText = getAllEntityText(newEntity, 0);
        text = text.concat(stateValueText);
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
