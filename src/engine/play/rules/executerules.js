'use strict';

const constants = require('../../constants');
const errors = require('../../errors');
const getEntity = require('../entities/getentity');
const updateEntity = require('../entities/updateentity');

module.exports = {
  execute: executeRules,
}

function executeRules(story, action, target, newPropertyValue, isTransition) {

  let messages = [];
  
  // Get entity property.
  let entityProperty = 
    getEntity.findProperty(story, target.entity, target.path, target.property);
  
  if (entityProperty == null) {
    console.log(errors.ENTITY_PROPERTY_NOT_FOUND(
      target.entity, target.property));
    return [story, messages];
  }

  // Apply rules to property.
  if (isTransition) {
    [entityProperty, messages] = 
      executeTransitionRules(action, entityProperty, newPropertyValue);
  } else {
    [entityProperty, messages] = 
      executePropertyRules(action, entityProperty);
  }

  // Update entity.
  story = updateEntity.updateProperty(story, target.entity, 
    target.path, target.property, entityProperty);

  return [story, messages];
}

function executeTransitionRules(action, entityProperty, newPropertyValue) {
  
  let messages = [];
  
  // Set property value.
  let oldPropertyValue = entityProperty.currentValue;

  // Set property.
  entityProperty.currentValue = newPropertyValue;
  
  // Execute transition rules.
  let propertyTransitionRules = 
    entityProperty.values[oldPropertyValue].
      relationships[newPropertyValue].rules;

  [entityProperty, messages] = 
    applyRules(action, oldPropertyValue, newPropertyValue,
      entityProperty, propertyTransitionRules, 0);

  return [entityProperty, messages];
}

function executePropertyRules(action, entityProperty) {

  let messages = [];

  // Set property value.
  let newPropertyValueName = entityProperty.currentValue;

  // Execute property value rules.
  let propertyValueRules = entityProperty.values[newPropertyValueName].rules;
  [entityProperty, messages] = 
    applyRules(action, newPropertyValueName, newPropertyValueName,
      entityProperty, propertyValueRules, 0);
  
  return [entityProperty, messages];
}
  
function applyRules(action, oldPropertyValue, newPropertyValue, 
  property, rules, recursion) {

  let messages = [];

  if (recursion >= constants.MAX_RECURSION) {
    console.log(errors.MAX_RECURSION);
    return [property, messages];
  }

  property = applyRuleValue(property, rules, oldPropertyValue);
  property = applyRuleDisable(property, rules);
  property = applyRuleEnable(property, rules);
  property = applyRuleActions(property, rules);
  messages = applyRuleMessage(property, rules, messages);

  [property, messages] = 
    applyRuleIfBlock(action, property, rules, messages, 
      oldPropertyValue, newPropertyValue, recursion);

  return [property, messages];
}

function applyRuleValue(property, rules, oldPropertyValue) {

  if (constants.KEY_VALUE in rules) {
    let propertyValue = rules[constants.KEY_VALUE];
    if (propertyValue === constants.KEY_LAST) {
      property.currentValue = oldPropertyValue;
    } else if (propertyValue in property.values) {
      property.currentValue = propertyValue;
    } else {
      console.log(errors.NOT_FOUND(propertyValue));
    }
  }

  return property;
}

function applyRuleDisable(property, rules) {
  
  if (constants.KEY_DISABLE in rules) {
    let disablePropertyValues = rules[constants.KEY_DISABLE];
    for (let disablePropertyValue of disablePropertyValues) {
      if (disablePropertyValue in property.values) {
        property.values[disablePropertyValue].disabled = true;
      } else {
        console.log(errors.NOT_FOUND(disablePropertyValue));
      }
    }
  }

  return property;
}

function applyRuleEnable(property, rules) {

  if (constants.KEY_ENABLE in rules) {
    let enablePropertyValues = rules[constants.KEY_ENABLE];
    for (let enablePropertyValue of enablePropertyValues) {
      if (enablePropertyValue in property.values) {
        property.values[enablePropertyValue].disabled = false;
      } else {
        console.log(errors.NOT_FOUND(enablePropertyValue));
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

function applyRuleIfBlock(action, entityProperty, rules, messages, 
  oldPropertyValueName, newPropertyValueName, recursion) {

  for (let trigger of Object.keys(rules)) {
    let words = trigger.split(' ');
    if (words.length > 1 && 
        words[0] == constants.KEY_IF) {

      let childRules = rules[trigger];
      let ifActionMessages = [];
      let ifPropertyMessages = [];

      [entityProperty, ifActionMessages] = applyRuleIfAction(action, 
        entityProperty, rules, oldPropertyValueName, newPropertyValueName,
        words, childRules, recursion);

      [entityProperty, ifPropertyMessages] = applyRuleIfValue(action, 
        entityProperty, rules, oldPropertyValueName, newPropertyValueName, 
        words, childRules, recursion);

      messages = messages.concat(ifActionMessages).concat(ifPropertyMessages);
    }
  }

  return [entityProperty, messages];
}

function applyRuleIfAction(action, 
  entityProperty, rules, oldPropertyValueName, newPropertyValueName,
  words, childRules, recursion) {

  let messages = [];

  // To handle "if {action}:"
  if (words.length == 2 && 
      words[0] == constants.KEY_IF &&
      words[1] == action.name) {
        
    [entityProperty, messages] = 
      applyRules(action, oldPropertyValueName, newPropertyValueName,
        entityProperty, childRules, recursion + 1) 
  }

  return [entityProperty, messages];
}

function applyRuleIfValue(action, 
  entityProperty, rules, oldPropertyValueName, newPropertyValueName,
  words, childRules, recursion) {

  let messages = [];

  // To handle "if {property} is {value}:"
  if (words.length == 4 &&
      words[0] == constants.KEY_IF &&
      words[2] == constants.KEY_IS) {

    let targetProperty = words[1];
    let targetPropertyValue = words[3];

    // Look at current property value, but also child entities of either
    // property value.
    if (isPropertyValue(entityProperty, '', targetProperty, targetPropertyValue, 0)) {

      [entityProperty, messages] = 
        applyRules(action, oldPropertyValueName, newPropertyValueName,
          entityProperty, childRules, recursion + 1);
    }
  }

  return [entityProperty, messages];
}

function isPropertyValue(property, propertyPrefix, targetProperty, targetPropertyValue, recursion) {

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
      property.currentValue == targetPropertyValue) {
    return true;
  } else {
    for (let propertyValue of Object.keys(property.values)) {
      for (let childEntity of property.values[propertyValue].childEntities) {
        let prefix = getPropertyPrefix(childEntity);
        for (let propertyName of Object.keys(childEntity.properties)) {
          let property = childEntity.properties[propertyName];
          if (isPropertyValue(property, prefix, 
              targetProperty, targetPropertyValue, recursion + 1)) {
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
