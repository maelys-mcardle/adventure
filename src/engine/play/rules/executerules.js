'use strict';

const constants = require('../../constants');
const errors = require('../../errors');
const getEntity = require('../entities/getentity');
const updateEntity = require('../entities/updateentity');

module.exports = {
  execute: executeRules,
}

function executeRules(story, action, target, newValue, isTransition) {

  let messages = [];
  
  // Get entity property.
  let property = 
    getEntity.findProperty(story, target.entity, target.path, target.property);
  
  if (property == null) {
    console.log(
      errors.ENTITY_PROPERTY_NOT_FOUND(target.entity, target.property));
    return [story, messages];
  }

  // Apply rules to property.
  if (isTransition) {
    [property, messages] = 
      executeTransitionRules(action, property, newValue);
  } else {
    [property, messages] = 
      executePropertyRules(action, property);
  }

  // Update entity.
  story = updateEntity.updateProperty(story, target.entity, 
    target.path, target.property, property);

  return [story, messages];
}

function executeTransitionRules(action, property, newValue) {
  
  let messages = [];
  
  // Set property value.
  let oldValue = property.currentValue;

  // Set property.
  property.currentValue = newValue;
  
  // Execute transition rules.
  let transitionRules = property.values[oldValue].relationships[newValue].rules;

  [property, messages] = 
    applyRules(action, oldValue, newValue, property, transitionRules, 0);

  return [property, messages];
}

function executePropertyRules(action, property) {

  let messages = [];

  // Set property value.
  let newValue = property.currentValue;

  // Execute property value rules.
  let rules = property.values[newValue].rules;
  [property, messages] = 
    applyRules(action, newValue, newValue, property, rules, 0);
  
  return [property, messages];
}
  
function applyRules(action, oldValue, newValue, 
  property, rules, recursion) {

  let messages = [];

  if (recursion >= constants.MAX_RECURSION) {
    console.log(errors.MAX_RECURSION);
    return [property, messages];
  }

  property = applyRuleValue(property, rules, oldValue);
  property = applyRuleDisable(property, rules);
  property = applyRuleEnable(property, rules);
  property = applyRuleActions(property, rules);
  messages = applyRuleMessage(property, rules, messages);

  [property, messages] = 
    applyRuleIfBlock(action, property, rules, messages, 
      oldValue, newValue, recursion);

  return [property, messages];
}

function applyRuleValue(property, rules, oldValue) {

  if (constants.KEY_VALUE in rules) {
    let newValue = rules[constants.KEY_VALUE];
    if (newValue === constants.KEY_LAST) {
      property.currentValue = oldValue;
    } else if (newValue in property.values) {
      property.currentValue = newValue;
    } else {
      console.log(errors.NOT_FOUND(newValue));
    }
  }

  return property;
}

function applyRuleDisable(property, rules) {
  
  if (constants.KEY_DISABLE in rules) {
    let disableValues = rules[constants.KEY_DISABLE];
    for (let disableValue of disableValues) {
      if (disableValue in property.values) {
        property.values[disableValue].disabled = true;
      } else {
        console.log(errors.NOT_FOUND(disableValue));
      }
    }
  }

  return property;
}

function applyRuleEnable(property, rules) {

  if (constants.KEY_ENABLE in rules) {
    let enableValues = rules[constants.KEY_ENABLE];
    for (let enableValue of enableValues) {
      if (enableValue in property.values) {
        property.values[enableValue].disabled = false;
      } else {
        console.log(errors.NOT_FOUND(enableValue));
      }
    }
  }

  return property;
}

function applyRuleActions(property, rules) {
  if (constants.KEY_ACTIONS in rules) {
    let actionsToAccept = rules[constants.KEY_ACTIONS];
    property.actions = actionsToAccept;
  }
  return property;
}

function applyRuleMessage(property, rules, messageQueue) {

  if (constants.KEY_MESSAGE in rules) {
    let messageKey = rules[constants.KEY_MESSAGE];
    if (messageKey in property.messages) {
      let messageText = property.messages[messageKey];
      messageQueue.push(messageText);
    } else {
      console.log(errors.NOT_FOUND(messageKey));
    }
  }

  return messageQueue;
}

function applyRuleIfBlock(action, property, rules, messages, 
  oldValue, newValue, recursion) {

  for (let trigger of Object.keys(rules)) {

    let words = trigger.split(' ');

    if (words.length > 1 && 
        words[0] == constants.KEY_IF) {

      let childRules = rules[trigger];
      let actionMessages = [];
      let propertyMessages = [];

      [property, actionMessages] = 
        applyRuleIfAction(action, property, rules, oldValue, newValue,
          words, childRules, recursion);

      [property, propertyMessages] = 
        applyRuleIfValue(action, property, rules, oldValue, newValue, 
          words, childRules, recursion);

      messages = messages.concat(actionMessages).concat(propertyMessages);
    }
  }

  return [property, messages];
}

function applyRuleIfAction(action, property, rules, oldValue, newValue,
    words, childRules, recursion) {

  let messages = [];

  // To handle "if {action}:"
  if (words.length == 2 && 
      words[0] == constants.KEY_IF &&
      words[1] == action.name) {
        
    [property, messages] = 
      applyRules(action, oldValue, newValue,
        property, childRules, recursion + 1) 
  }

  return [property, messages];
}

function applyRuleIfValue(action, property, rules, oldValue, newValue,
  words, childRules, recursion) {

  let messages = [];

  // To handle "if {property} is {value}:"
  if (words.length == 4 &&
      words[0] == constants.KEY_IF &&
      words[2] == constants.KEY_IS) {

    let targetProperty = words[1];
    let targetValue = words[3];

    // Look at current property value, but also child entities of either
    // property value.
    if (isPropertyValue(property, '', targetProperty, targetValue, 0)) {

      [property, messages] = 
        applyRules(action, oldValue, newValue, 
          property, childRules, recursion + 1);
    }
  }

  return [property, messages];
}

function isPropertyValue(property, propertyPrefix, targetProperty, 
  targetValue, recursion) {

  // property can be:
  //  property
  //  property.childEntity.childProperty
  //  property.childEntity.childProperty.[..].childProperty

  if (recursion >= constants.MAX_RECURSION) {
    console.log(errors.MAX_RECURSION);
    return false;
  }

  let currentPropertyName = propertyPrefix + property.name;
  if (currentPropertyName.endsWith(targetProperty) && 
      property.currentValue == targetValue) {
    return true;
  } else {
    for (let value of Object.keys(property.values)) {
      for (let childEntity of property.values[value].childEntities) {
        let prefix = getPropertyPrefix(childEntity);
        for (let propertyName of Object.keys(childEntity.properties)) {
          let property = childEntity.properties[propertyName];
          if (isPropertyValue(property, prefix, 
              targetProperty, targetValue, recursion + 1)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

function getPropertyPrefix(entity) {
  return entity.path + constants.PATH_SEP + entity.name + constants.PATH_SEP;
}
