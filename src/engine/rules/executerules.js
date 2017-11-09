'use strict';

const constants = require('../../constants');
const stateRules = require('./staterules');

module.exports = {
  before: executeTransitionRules,
  after: executeStateRules
}

function executeTransitionRules(story, actionName, targetEntityName, 
  targetEntityPath, targetStateName, newStateValueName) {

  return executeRules(story, actionName, targetEntityName, 
    targetEntityPath, targetStateName, newStateValueName, true);
}

function executeStateRules(story, actionName, targetEntityName, 
  targetEntityPath, targetStateName) {

  return executeRules(story, actionName, targetEntityName, 
    targetEntityPath, targetStateName, null, false);
}

function executeRules(story, actionName, targetEntityName, 
  targetEntityPath, targetStateName, newStateValueName, isTransition) {

  let messages = [];
  
  // Get entity state.
  let entityState = 
    findEntityState(story, targetEntityName, targetEntityPath, targetStateName);
  
  if (entityState == null) {
    console.log('Could not find ' + targetEntityName + ' ' + targetStateName);
    return [story, messages];
  }

  // Apply rules to state.
  if (isTransition) {
    [entityState, messages] = 
      stateRules.transition(actionName, entityState, newStateValueName);
  } else {
    [entityState, messages] = 
      stateRules.state(actionName, entityState);
  }

  // Update entity.
  story = updateEntityState(story, targetEntityName, 
    targetEntityPath, targetStateName, entityState);

  return [story, messages];
}

function findEntityState(story, targetEntityName, targetEntityPath, 
  targetStateName) {

  for (let entity of story.currentState) {
    let entityState = getEntityStateByName(entity, 
      targetEntityName, targetEntityPath, targetStateName, 0);

    if (entityState != null) {
      return entityState;
    }
  }

  return null;
}

function updateEntityState(story, targetEntityName, targetEntityPath, 
  targetStateName, updatedState) {

  for (let entityIndex in story.currentState) {
    let entity = story.currentState[entityIndex];

    entity = updateEntityStateByName(entity, targetEntityName, targetEntityPath, 
      targetStateName, updatedState, 0);

    story.currentState[entityIndex] = entity;
  }

  return story;
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