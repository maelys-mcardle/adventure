'use strict';

const constants = require('../constants');
const getEntity = require('../entities/getentity');
const updateEntity = require('../entities/updateentity');

module.exports = {
  execute: executeRules,
}

function executeRules(story, action, targetEntityName, 
  targetEntityPath, targetPropertyName, newPropertyValueName, isTransition) {

  let messages = [];
  
  // Get entity state.
  let entityProperty = 
    getEntity.findProperty(story, targetEntityName, 
      targetEntityPath, targetPropertyName);
  
  if (entityProperty == null) {
    console.log(`Could not find ${targetEntityName} ${targetPropertyName}`);
    return [story, messages];
  }

  // Apply rules to state.
  if (isTransition) {
    [entityProperty, messages] = 
      executeTransitionRules(action, entityProperty, newPropertyValueName);
  } else {
    [entityProperty, messages] = 
      executeStateRules(action, entityProperty);
  }

  // Update entity.
  story = updateEntity.updateProperty(story, targetEntityName, 
    targetEntityPath, targetPropertyName, entityProperty);

  return [story, messages];
}

function executeTransitionRules(action, entityProperty, newPropertyValueName) {
  
  let messages = [];
  
  // Set state value.
  let oldPropertyValueName = entityProperty.currentValue;

  // Set state.
  entityProperty.currentValue = newPropertyValueName;
  
  // Execute transition rules.
  let stateTransitionRules = 
    entityProperty.values[oldPropertyValueName].
      relationships[newPropertyValueName].rules;

  [entityProperty, messages] = 
    applyRules(action, oldPropertyValueName, newPropertyValueName,
      entityProperty, stateTransitionRules, 0);

  return [entityProperty, messages];
}

function executeStateRules(action, entityProperty) {

  let messages = [];

  // Set state value.
  let newPropertyValueName = entityProperty.currentValue;

  // Execute state value rules.
  let stateValueRules = entityProperty.values[newPropertyValueName].rules;
  [entityProperty, messages] = 
    applyRules(action, newPropertyValueName, newPropertyValueName,
      entityProperty, stateValueRules, 0);
  
  return [entityProperty, messages];
}
  
function applyRules(action, oldPropertyValueName, newPropertyValueName, 
  entityProperty, rules, recursion) {

  let messages = [];

  if (recursion >= constants.MAX_RECURSION) {
    console.log(contants.MAX_RECURSION_MESSAGE);
    return [entityProperty, messages];
  }

  entityProperty = applyRuleState(entityProperty, rules, oldPropertyValueName);
  entityProperty = applyRuleDisable(entityProperty, rules);
  entityProperty = applyRuleEnable(entityProperty, rules);
  messages = applyRuleMessage(entityProperty, rules, messages);

  [entityProperty, messages] = 
    applyRuleIfBlock(action, entityProperty, rules, messages, 
      oldPropertyValueName, newPropertyValueName, recursion);

  return [entityProperty, messages];
}

function applyRuleState(entityProperty, rules, oldPropertyValueName) {

  if ('state' in rules) {
    if (rules.state === '.last') {
      entityProperty.currentValue = oldPropertyValueName;
    } else if (rules.state in entityProperty.values) {
      entityProperty.currentValue = rules.state;
    } else {
      console.log(`${rules.state} not found.`);
    }
  }

  return entityProperty;
}

function applyRuleDisable(entityProperty, rules) {
  
  if ('disable' in rules) {
    for (let disableStateValue of rules.disable) {
      if (disableStateValue in entityProperty.values) {
        entityProperty.values[disableStateValue].disabled = true;
      } else {
        console.log(`${disableStateValue} not found.`);
      }
    }
  }

  return entityProperty;
}

function applyRuleEnable(entityProperty, rules) {

  if ('enable' in rules) {
    for (let enableStateValue of rules.enable) {
      if (enableStateValue in entityProperty.values) {
        entityProperty.values[enableStateValue].disabled = false;
      } else {
        console.log(`${enableStateValue} not found.`);
      }
    }
  }

  return entityProperty;
}

function applyRuleMessage(entityProperty, rules, messages) {

  if ('message' in rules) {
    if (rules.message in entityProperty.messages) {
      let message = entityProperty.messages[rules.message];
      messages.push(message);
    } else {
      console.log(`${rules.message} not found.`);
    }
  }

  return messages;
}

function applyRuleIfBlock(action, entityProperty, rules, messages, 
  oldPropertyValueName, newPropertyValueName, recursion) {

  for (let trigger of Object.keys(rules)) {
    let words = trigger.split(' ');
    if (words.length > 1 && words[0] == 'if') {

      let childRules = rules[trigger];
      let ifActionMessages = [];
      let ifStateMessages = [];

      [entityProperty, ifActionMessages] = applyRuleIfAction(action, 
        entityProperty, rules, oldPropertyValueName, newPropertyValueName,
        words, childRules, recursion);

      [entityProperty, ifStateMessages] = applyRuleIfState(action, 
        entityProperty, rules, oldPropertyValueName, newPropertyValueName, 
        words, childRules, recursion);

      messages = messages.concat(ifActionMessages).concat(ifStateMessages);
    }
  }

  return [entityProperty, messages];
}

function applyRuleIfAction(action, 
  entityProperty, rules, oldPropertyValueName, newPropertyValueName,
  words, childRules, recursion) {

  let messages = [];

  // if action X
  if (words.length == 3 && 
    words[1] == 'action' && 
    words[2] == action.name) {
        
    [entityProperty, messages] = 
      applyRules(action, oldPropertyValueName, newPropertyValueName,
        entityProperty, childRules, recursion + 1) 
  }

  return [entityProperty, messages];
}

function applyRuleIfState(action, 
  entityProperty, rules, oldPropertyValueName, newPropertyValueName,
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
    if (isStateValue(entityProperty, '', targetState, targetStateValue, 0)) {

      [entityProperty, messages] = 
        applyRules(action, oldPropertyValueName, newPropertyValueName,
          entityProperty, childRules, recursion + 1);
    }
  }

  return [entityProperty, messages];
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
