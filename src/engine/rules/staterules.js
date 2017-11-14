'use strict';

const constants = require('../../constants');

module.exports = {
  transition: executeTransitionRules,
  state: executeStateRules,
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
    console.log('Max recursion reached.');
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
      console.log(rules.state + ' not found.');
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
        console.log(disableStateValue + ' not found.');
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
        console.log(enableStateValue + ' not found.');
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
      console.log(rules.message + ' not found.');
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
    if (isStateValue(entityState, oldStateValueName, 
          targetState, targetStateValue, 0) ||
        isStateValue(entityState, newStateValueName, 
          targetState, targetStateValue, 0)) {

      [entityState, messages] = 
        applyRules(action, oldStateValueName, newStateValueName,
          entityState, childRules, recursion + 1);
    }
  }

  return [entityState, messages];
}

function isStateValue(state, stateValue, targetState, targetStateValue, recursion) {

  // state can be:
  //  state
  //  state.childEntity.childState
  //  state.childEntity.childState.[..].childState

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