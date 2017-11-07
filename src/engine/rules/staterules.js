'use strict';

module.exports = {
  execute: executeEntityStateRules
}

function executeEntityStateRules(actionName, entityState, newStateValueName) {
  
    let transitionMessages = [];
    let stateMessages = [];
  
    // Set state value.
    let oldStateValueName = entityState.currentValue;
    entityState.currentValue = newStateValueName;
  
    // Execute transition rules.
    let stateTransitionRules = 
      entityState.values[oldStateValueName].
        relationships[newStateValueName].rules;
    [entityState, transitionMessages] = 
      applyRules(actionName, entityState, stateTransitionRules);
  
    // Execute state value rules.
    let stateValueRules = entityState.values[newStateValueName].rules;
    [entityState, stateMessages] = 
      applyRules(actionName, entityState, stateValueRules);
  
    // Concatenate messages.
    let messages = transitionMessages.concat(stateMessages);
  
    return [entityState, messages];
  }
  
  function applyRules(actionName, entityState, rules) {
    let messages = [];
    return [entityState, []];
  }