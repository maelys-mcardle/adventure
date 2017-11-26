'use strict';

const constants = require('../constants');
const getEntity = require('../entities/getentity');
const updateEntity = require('../entities/updateentity');

module.exports = {
  execute: executeRules,
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
      executeTransitionRules(action, entityState, newStateValueName);
  } else {
    [entityState, messages] = 
      executeStateRules(action, entityState);
  }

  // Update entity.
  story = updateEntity.updateState(story, targetEntityName, 
    targetEntityPath, targetStateName, entityState);

  return [story, messages];
}

function executeTransitionRules(action, entityState, newStateValueName) {
  
  let messages = [];
  
  // Set state value.
  let oldStateValueName = entityState.currentValue;

  // Set state.
  entityState.currentValue = newStateValueName;
  
  // Execute transition rules.
  let stateTransitionRules = 
    entityState.values[oldStateValueName].
      relationships[newStateValueName].rules;

  [entityState, messages] = 
    applyRules(action, oldStateValueName, newStateValueName,
      entityState, stateTransitionRules, 0);

  return [entityState, messages];
}

function executeStateRules(action, entityState) {

  let messages = [];

  // Set state value.
  let newStateValueName = entityState.currentValue;

  // Execute state value rules.
  let stateValueRules = entityState.values[newStateValueName].rules;
  [entityState, messages] = 
    applyRules(action, newStateValueName, newStateValueName,
      entityState, stateValueRules, 0);
  
  return [entityState, messages];
}
  
function applyRules(action, oldStateValueName, newStateValueName, 
  entityState, rules, recursion) {

  let messages = [];

  if (recursion >= constants.MAX_RECURSION) {
    console.log(contants.MAX_RECURSION_MESSAGE);
    return [entityState, messages];
  }

  entityState = applyRuleState(entityState, rules, oldStateValueName);
  entityState = applyRuleDisable(entityState, rules);
  entityState = applyRuleEnable(entityState, rules);
  messages = applyRuleMessage(entityState, rules, messages);

  [entityState, messages] = 
    applyRuleIfBlock(action, entityState, rules, messages, 
      oldStateValueName, newStateValueName, recursion);

  return [entityState, messages];
}

function applyRuleState(entityState, rules, oldStateValueName) {

  if ('state' in rules) {
    if (rules.state === '.last') {
      entityState.currentValue = oldStateValueName;
    } else if (rules.state in entityState.values) {
      entityState.currentValue = rules.state;
    } else {
      console.log(`${rules.state} not found.`);
    }
  }

  return entityState;
}

function applyRuleDisable(entityState, rules) {
  
  if ('disable' in rules) {
    for (let disableStateValue of rules.disable) {
      if (disableStateValue in entityState.values) {
        entityState.values[disableStateValue].disabled = true;
      } else {
        console.log(`${disableStateValue} not found.`);
      }
    }
  }

  return entityState;
}

function applyRuleEnable(entityState, rules) {

  if ('enable' in rules) {
    for (let enableStateValue of rules.enable) {
      if (enableStateValue in entityState.values) {
        entityState.values[enableStateValue].disabled = false;
      } else {
        console.log(`${enableStateValue} not found.`);
      }
    }
  }

  return entityState;
}

function applyRuleMessage(entityState, rules, messages) {

  if ('message' in rules) {
    if (rules.message in entityState.messages) {
      let message = entityState.messages[rules.message];
      messages.push(message);
    } else {
      console.log(`${rules.message} not found.`);
    }
  }

  return messages;
}

function applyRuleIfBlock(action, entityState, rules, messages, 
  oldStateValueName, newStateValueName, recursion) {

  for (let trigger of Object.keys(rules)) {
    let words = trigger.split(' ');
    if (words.length > 1 && words[0] == 'if') {

      let childRules = rules[trigger];
      let ifActionMessages = [];
      let ifStateMessages = [];

      [entityState, ifActionMessages] = applyRuleIfAction(action, 
        entityState, rules, oldStateValueName, newStateValueName,
        words, childRules, recursion);

      [entityState, ifStateMessages] = applyRuleIfState(action, 
        entityState, rules, oldStateValueName, newStateValueName, 
        words, childRules, recursion);

      messages = messages.concat(ifActionMessages).concat(ifStateMessages);
    }
  }

  return [entityState, messages];
}

function applyRuleIfAction(action, 
  entityState, rules, oldStateValueName, newStateValueName,
  words, childRules, recursion) {

  let messages = [];

  // if action X
  if (words.length == 3 && 
    words[1] == 'action' && 
    words[2] == action.name) {
        
    [entityState, messages] = 
      applyRules(action, oldStateValueName, newStateValueName,
        entityState, childRules, recursion + 1) 
  }

  return [entityState, messages];
}

function applyRuleIfState(action, 
  entityState, rules, oldStateValueName, newStateValueName,
  words, childRules, recursion) {

  let messages = [];

  // if state X is Y
  if (words.length == 5 &&
    words[1] == 'state' &&
    words[3] == 'is') {

    let targetState = words[2];
    let targetStateValue = words[4];

    // Look at current state value, but also child entities of either
    // state value.
    if (isStateValue(entityState, '', targetState, targetStateValue, 0)) {

      [entityState, messages] = 
        applyRules(action, oldStateValueName, newStateValueName,
          entityState, childRules, recursion + 1);
    }
  }

  return [entityState, messages];
}

function isStateValue(state, statePrefix, targetState, targetStateValue, recursion) {

  // state can be:
  //  state
  //  state.childEntity.childState
  //  state.childEntity.childState.[..].childState

  if (recursion >= constants.MAX_RECURSION) {
    console.log(contants.MAX_RECURSION_MESSAGE);
    return false;
  }

  let currentStateName = statePrefix + state.name;
  if (currentStateName.endsWith(targetState) && 
      state.currentValue == targetStateValue) {
    return true;
  } else {
    for (let stateValue of Object.keys(state.values)) {
      for (let childEntity of state.values[stateValue].childEntities) {
        let prefix = getStatePrefix(childEntity);
        for (let propertyName of Object.keys(childEntity.properties)) {
          let state = childEntity.properties[propertyName];
          if (isStateValue(state, prefix, 
              targetState, targetStateValue, recursion + 1)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

function getStatePrefix(entity) {
  return entity.path + '.' + entity.name + '.';
}
