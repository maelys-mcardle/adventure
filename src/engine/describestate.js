'use strict';

module.exports = {
  getDelta: getStateDeltaText,
  getEntity: getStateEntityText,
  getAll: getAllStateText
}

function getStateDeltaText(oldStory, newStory) {
  let text = [];

  for (let entityIndex in oldStory.currentState) {
    let oldEntity = oldStory.currentState[entityIndex];
    let newEntity = newStory.currentState[entityIndex];

    for (let stateName of Object.keys(oldEntity.states)) {
      let oldValue = oldEntity.states[stateName].currentValue;
      let newValue = newEntity.states[stateName].currentValue;
      let newState = newEntity.states[stateName];

      if (oldValue != newValue) {
        let stateValueText = getStateValueText(newState, newValue);
        text.push(stateValueText);
      }
    }
  }

  return text;
}

function getAllStateText(story) {
  let text = [];

  for (let entityIndex in story.currentState) {
    let entity = story.currentState[entityIndex];

    for (let stateName of Object.keys(entity.states)) {
      let state = entity.states[stateName];
      let value = state.currentValue;

      let stateValueText = getStateValueText(state, value);
      text.push(stateValueText);
    }
  }

  return text;
}

function getStateValueText(state, valueName) {
  let text = state.values[valueName].text;
  return text;
}

function getStateEntityText(story, entityName) {

}
