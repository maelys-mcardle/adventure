'use strict';

const constants = require('../constants');

module.exports = {
  execute: executeEntityStateRules
}

function executeEntityStateRules(actionName, entityState, newStateValueName) {
  
    let transitionMessages = [];
    let stateMessages = [];
  
    // Set state value.
    let oldStateValueName = entityState.currentValue;
  
    // Execute transition rules.
    let stateTransitionRules = 
      entityState.values[oldStateValueName].
        relationships[newStateValueName].rules;
    [entityState, transitionMessages] = 
      applyRules(actionName, oldStateValueName, 
        entityState, stateTransitionRules, 0);

    // Set state.
    entityState.currentValue = newStateValueName;

    // Read state delta.
  
    // Execute state value rules.
    let stateValueRules = entityState.values[newStateValueName].rules;
    [entityState, stateMessages] = 
      applyRules(actionName, oldStateValueName,
        entityState, stateValueRules, 0);
  
    // Concatenate messages.
    let messages = transitionMessages.concat(stateMessages);
  
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