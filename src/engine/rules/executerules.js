'use strict';

const constants = require('../../constants');
const stateRules = require('./staterules');
const getEntity = require('../entities/getentity');
const updateEntity = require('../entities/updateentity');

module.exports = {
  before: executeTransitionRules,
  after: executeStateRules
}

function executeTransitionRules(story, action, targetEntityName, 
  targetEntityPath, targetStateName, newStateValueName) {

  return executeRules(story, action, targetEntityName, 
    targetEntityPath, targetStateName, newStateValueName, true);
}

function executeStateRules(story, action, targetEntityName, 
  targetEntityPath, targetStateName) {

  return executeRules(story, action, targetEntityName, 
    targetEntityPath, targetStateName, null, false);
}

function executeRules(story, action, targetEntityName, 
  targetEntityPath, targetStateName, newStateValueName, isTransition) {

  let messages = [];
  
  // Get entity state.
  let entityState = 
    getEntity.findState(story, targetEntityName, 
      targetEntityPath, targetStateName);
  
  if (entityState == null) {
    console.log(`Could not find ${targetEntityName} ${targetStateName}`);
    return [story, messages];
  }

  // Apply rules to state.
  if (isTransition) {
    [entityState, messages] = 
      stateRules.transition(action, entityState, newStateValueName);
  } else {
    [entityState, messages] = 
      stateRules.state(action, entityState);
  }

  // Update entity.
  story = updateEntity.updateState(story, targetEntityName, 
    targetEntityPath, targetStateName, entityState);

  return [story, messages];
}
