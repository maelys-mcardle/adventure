'use strict';

const constants = require('../../constants');

module.exports = {
  transition: executeTransitionRules,
  state: executeStateRules,
}

function executeTransitionRules(actionName, entityState, newStateValueName) {
  
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
    applyRules(actionName, oldStateValueName, newStateValueName,
      entityState, stateTransitionRules, 0);

  return [entityState, messages];
}

function executeStateRules(actionName, entityState) {

  let messages = [];

  // Set state value.
  let newStateValueName = entityState.currentValue;

  // Execute state value rules.
  let stateValueRules = entityState.values[newStateValueName].rules;
  [entityState, messages] = 
    applyRules(actionName, newStateValueName, newStateValueName,
      entityState, stateValueRules, 0);
  
  return [entityState, messages];
}
  
function applyRules(actionName, oldStateValueName, newStateValueName, 
  entityState, rules, recursion) {

  let messages = [];

  if (recursion >= constants.MAX_RECURSION) {
    console.log('Max recursion reached.');
    return [entityState, messages];
  }

  if ('state' in rules) {
    if (rules.state === '.last') {
      entityState.currentValue = oldStateValueName;
    } else if (rules.state in entityState.values) {
      entityState.currentValue = rules.state;
    } else {
      console.log(rules.state + ' not found.');
    }
  }

  if ('disable' in rules) {
    for (let disableStateValue of rules.disable) {
      if (disableStateValue in entityState.values) {
        entityState.values[disableStateValue].disabled = true;
      } else {
        console.log(disableStateValue + ' not found.');
      }
    }
  }

  if ('enable' in rules) {
    for (let enableStateValue of rules.enable) {
      if (enableStateValue in entityState.values) {
        entityState.values[enableStateValue].disabled = false;
      } else {
        console.log(enableStateValue + ' not found.');
      }
    }
  }

  if ('message' in rules) {
    if (rules.message in entityState.messages) {
      let message = entityState.messages[rules.message];
      messages.push(message);
    } else {
      console.log(rules.message + ' not found.');
    }
  }

  for (let trigger of Object.keys(rules)) {
    let words = trigger.split(' ');
    if (words.length > 1 && words[0] == 'if') {

      let childRules = rules[trigger];
      let childMessages = [];

      // if action X
      if (words.length == 3 && 
          words[1] == 'action' && 
          words[2] == actionName) {
            
        [entityState, childMessages] = 
          applyRules(actionName, oldStateValueName, newStateValueName,
            entityState, childRules, recursion + 1) 
        messages = messages.concat(childMessages);
      }

      // if state X is Y
      if (words.length == 5 &&
          words[1] == 'state' &&
          words[3] == 'is') {

        let targetState = words[2];
        let targetStateValue = words[4];

        // Look at current state value, but also child entities of either
        // state value.
        if (isStateValue(entityState, oldStateValueName, 
              targetState, targetStateValue, 0) ||
            isStateValue(entityState, newStateValueName, 
              targetState, targetStateValue, 0)) {

          [entityState, childMessages] = 
            applyRules(actionName, oldStateValueName, newStateValueName,
              entityState, childRules, recursion + 1);
          
          messages = messages.concat(childMessages);
        }
      }
    }
  }

  return [entityState, messages];
}

function isStateValue(state, stateValue, targetState, targetStateValue, recursion) {

  if (recursion >= constants.MAX_RECURSION) {
    console.log('Max recursion reached');
    return false;
  }

  if (state.name == targetState && stateValue == targetStateValue) {
    return true;
  } else {
    for (let childEntity of state.values[stateValue].childEntities) {
      for (let stateName of Object.keys(childEntity.states)) {
        let state = childEntity.states[stateName];
        if (isStateValue(state, state.currentValue, 
             targetState, targetStateValue, recursion + 1)) {
          return true;
        }
      }
    }
  }

  return false;
}