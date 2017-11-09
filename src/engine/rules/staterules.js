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
    applyRules(actionName, oldStateValueName, 
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
    applyRules(actionName, newStateValueName,
      entityState, stateValueRules, 0);
  
  return [entityState, messages];
}
  
function applyRules(actionName, oldStateValueName, entityState, 
  rules, recursion) {

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

      // if action X
      if (words.length == 3 && 
          words[1] == 'action' && 
          words[2] == actionName) {
            
        let childRules = rules[trigger];
        let childMessages = [];
        [entityState, childMessages] = 
          applyRules(actionName, oldStateValueName, entityState, 
            childRules, recursion + 1) 
        messages = messages.concat(childMessages);
      }

    }
  }

  return [entityState, messages];
}