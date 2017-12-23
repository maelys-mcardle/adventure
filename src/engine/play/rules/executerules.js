'use strict';

const constants = require('../../constants');
const errors = require('../../errors');
const getEntity = require('../entities/getentity');
const updateEntity = require('../entities/updateentity');

module.exports = {
  execute: executeRules,
}

/**
 * Executes rules for an entity's property.
 * @param {Story} story The story object.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Target} target The entity/property that was acted upon.
 * @param {string} newValue The new value for the entity/property.
 * @param {bool} isTransition Whether the rules to execute are those between
 *                            values (in transition) or those for the current
 *                            value.
 * @returns {[Story, string[]]} The updated story and messages to output.
 */
function executeRules(story, action, target, newValue, isTransition) {

  let messages = [];
  
  // Get entity property.
  let property = getEntity.findProperty(story, target);
  
  if (property == null) {
    console.log(
      errors.ENTITY_PROPERTY_NOT_FOUND(target.entity, target.property));
    return [story, messages];
  }

  // Apply rules to property.
  // There are two sets of rules: one for transitioning from one value to 
  // another, and another for the being at a given value.
  if (isTransition) {
    [property, messages] = 
      executeRulesForBetweenValues(action, property, newValue);
  } else {
    [property, messages] = 
      executeRulesForCurrentValue(action, property);
  }

  // Update entity.
  story = updateEntity.updateProperty(story, target, property);

  return [story, messages];
}

/**
 * Executes rules between values for an entity's property.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Property} property The property that was acted upon.
 * @param {string} newValue The new value for the entity/property.
 * @returns {[Property, string[]]} The updated property and messages to output.
 */
function executeRulesForBetweenValues(action, property, newValue) {
  
  let messages = [];
  
  // Set property value.
  let oldValue = property.currentValue;

  // Set property.
  property.currentValue = newValue;
  
  // Execute transition rules.
  let rules = property.values[oldValue].relationships[newValue].rules;

  [property, messages] = 
    applyRules(rules, action, property, oldValue, newValue, 0);

  return [property, messages];
}

/**
 * Executes rules for the current value of an entity's property.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Property} property The property that was acted upon.
 * @returns {[Property, string[]]} The updated property and messages to output.
 */
function executeRulesForCurrentValue(action, property) {

  let messages = [];

  // Set property value.
  let newValue = property.currentValue;

  // Execute property value rules.
  let rules = property.values[newValue].rules;
  [property, messages] = 
    applyRules(rules, action, property, newValue, newValue, 0);
  
  return [property, messages];
}

/**
 * Apply the rules on a property.
 * @param {Object} rules The rules to execute.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Property} property The property that was acted upon.
 * @param {string} oldValue The previous value for the property.
 * @param {string} newValue The new value for the property.
 * @param {number} recursion To prevent infinite loops.
 * @returns {[Property, string[]]} The updated property and messages to output.
 */
function applyRules(rules, action, property, oldValue, newValue, recursion) {

  let messages = [];

  if (recursion >= constants.MAX_RECURSION) {
    console.log(errors.MAX_RECURSION);
    return [property, messages];
  }

  property = applyRuleValue(rules, property, oldValue);
  property = applyRuleDisable(rules, property);
  property = applyRuleEnable(rules, property);
  property = applyRuleActions(rules, property);
  messages = applyRuleMessage(rules, property, messages);

  [property, messages] = 
    applyRuleIfBlock(rules, action, property, oldValue, newValue, 
      messages, recursion);

  return [property, messages];
}

/**
 * Rule to set a property value.
 * @param {Object} rules The rules to execute.
 * @param {Property} property The property that was acted upon.
 * @param {string} oldValue The previous value for the property.
 * @returns {Property} The updated property.
 */
function applyRuleValue(rules, property, oldValue) {

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

/**
 * Rule to disable values.
 * @param {Object} rules The rules to execute.
 * @param {Property} property The property that was acted upon.
 * @returns {Property} The updated property.
 */
function applyRuleDisable(rules, property) {
  
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

/**
 * Rule to enable values.
 * @param {Object} rules The rules to execute.
 * @param {Property} property The property that was acted upon.
 * @returns {Property} The updated property.
 */
function applyRuleEnable(rules, property) {

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

/**
 * Rule to set actions for the property.
 * @param {Object} rules The rules to execute.
 * @param {Property} property The property that was acted upon.
 * @returns {Property} The updated property.
 */
function applyRuleActions(rules, property) {
  if (constants.KEY_ACTIONS in rules) {
    let actionsToAccept = rules[constants.KEY_ACTIONS];
    property.actions = actionsToAccept;
  }
  return property;
}

/**
 * Rule to emit a message for the property.
 * @param {Object} rules The rules to execute.
 * @param {Property} property The property that was acted upon.
 * @param {string[]} messages The existing messages for the property.
 * @returns {string[]} The updated messages for the property.
 */
function applyRuleMessage(rules, property, messages) {

  if (constants.KEY_MESSAGE in rules) {
    let messageKey = rules[constants.KEY_MESSAGE];
    if (messageKey in property.messages) {
      let messageText = property.messages[messageKey];
      messages.push(messageText);
    } else {
      console.log(errors.NOT_FOUND(messageKey));
    }
  }

  return messages;
}

/**
 * Conditional rule (if block) with contents to execute if true.
 * @param {Object} rules The rules to execute.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Property} property The property that was acted upon.
 * @param {string} oldValue The previous value for the property.
 * @param {string} newValue The new value for the property.
 * @param {string[]} messages The messages for the property.
 * @param {number} recursion To prevent infinite loops.
 * @returns {[Property, string[]]} The updated property and messages to output.
 */
function applyRuleIfBlock(rules, action, property, oldValue, newValue, 
  messages, recursion) {

  for (let trigger of Object.keys(rules)) {

    let words = trigger.split(' ');

    if (words.length > 1 && 
        words[0] == constants.KEY_IF) {

      let ifBlockRules = rules[trigger];
      let actionMessages = [];
      let propertyMessages = [];

      [property, actionMessages] = 
        applyRuleIfAction(ifBlockRules, action, property, oldValue, newValue,
          words, recursion);

      [property, propertyMessages] = 
        applyRuleIfValue(ifBlockRules, action, property, oldValue, newValue, 
          words, recursion);

      messages = messages.concat(actionMessages).concat(propertyMessages);
    }
  }

  return [property, messages];
}

/**
 * Conditional rule (if block) with contents to execute if a specific 
 * action was done.
 * @param {Object} rules The rules to execute.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Property} property The property that was acted upon.
 * @param {string} oldValue The previous value for the property.
 * @param {string} newValue The new value for the property.
 * @param {string[]} words The words in the if statement.
 * @param {number} recursion To prevent infinite loops.
 * @returns {[Property, string[]]} The updated property and messages to output.
 */
function applyRuleIfAction(rules, action, property, oldValue, newValue,
    words, recursion) {

  let messages = [];

  // To handle "if {action}:"
  if (words.length == 2 && 
      words[0] == constants.KEY_IF &&
      words[1] == action.name) {
        
    [property, messages] = 
      applyRules(rules, action, property, oldValue, newValue, recursion + 1);
  }

  return [property, messages];
}

/**
 * Conditional rule (if block) with contents to execute if a property 
 * has a specific value.
 * @param {Object} rules The rules to execute.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Property} property The property that was acted upon.
 * @param {string} oldValue The previous value for the property.
 * @param {string} newValue The new value for the property.
 * @param {string[]} words The words in the if statement.
 * @param {number} recursion To prevent infinite loops.
 * @returns {[Property, string[]]} The updated property and messages to output.
 */
function applyRuleIfValue(rules, action, property, oldValue, newValue,
  words, recursion) {

  let messages = [];

  // To handle "if {property} is {value}:"
  if (words.length == 4 &&
      words[0] == constants.KEY_IF &&
      words[2] == constants.KEY_IS) {

    let targetProperty = words[1];
    let targetValue = words[3];

    // Look at current property value, but also child entities of either
    // property value.
    if (isCurrentValue(property, '', targetProperty, targetValue, 0)) {

      [property, messages] = 
        applyRules(rules, action, property, oldValue, newValue, recursion + 1);
    }
  }

  return [property, messages];
}

/**
 * Determines if a property has a specific value.
 * @param {Property} property The current property.
 * @param {string} propertyPrefix The path to the current property.
 * @param {string} targetProperty The property to target.
 * @param {string} targetValue The value to see if the property has currently.
 * @param {number} recursion To prevent infinite loops.
 * @returns {bool} True if the target property has the target value.
 */
function isCurrentValue(property, propertyPrefix, targetProperty, 
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

        let prefix = childEntity.path + constants.PATH_SEP + 
          childEntity.name + constants.PATH_SEP;

        for (let propertyName of Object.keys(childEntity.properties)) {
          let property = childEntity.properties[propertyName];
          if (isCurrentValue(property, prefix, 
              targetProperty, targetValue, recursion + 1)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}
