'use strict';

const getProperty = require('../entities/getproperty');
const setProperty = require('../entities/setproperty');
const constants = require('../../constants');
const errors = require('../../errors');
const log = require('../../log');

module.exports = {
  executeTransition: executeTransitionRules,
  executeCurrent: executeCurrentValueRules
}

/**
 * Executes rules for an entity's property.
 * @param {Story} story The story object.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Target} target The entity/property that was acted upon.
 * @param {string} newValue The new value for the entity/property.
 * @returns {[Story, string[]]} The updated story and messages to output.
 */
function executeTransitionRules(story, action, target, newValue) {

  let messages = [];
  
  // Get property.
  let property = getProperty.getProperty(story, target);
  
  if (property == null) {
    log.warn(
      errors.ENTITY_PROPERTY_NOT_FOUND(
        target.entity.name, target.property.name));
    return [story, messages];
  }

  // Execute rules.
  [property, messages] = 
      executeRulesForBetweenValues(action, property, newValue);

  // Update property.
  story = setProperty.setProperty(story, target, property);

  return [story, messages];
}

/**
 * Executes rules for all the current values of all properties.
 * @param {Story} story The story object.
 * @returns {[Story, string[]]} The updated story and messages to output.
 */
function executeCurrentValueRules(story) {

  let [updatedEntity, messages] = 
    executeRulesForCurrentValue(story.rootEntity, 0);

  story.rootEntity = updatedEntity;

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
    applyRules(rules, action, property, oldValue, 0);

  return [property, messages];
}

/**
 * Executes rules for the current value of an entity's properties.
 * @param {Entity} entity The entity whose current values to execute rules.
 * @param {number} recursion Prevents infinite loops.
 * @returns {[Entity, string[]]} The updated entity and messages to output.
 */
function executeRulesForCurrentValue(entity, recursion) {

  let messages = [];

  if (recursion >= constants.MAX_RECURSION) {
    log.warn(errors.MAX_RECURSION);
    return [entity, messages];
  }

  // Go through each of the entity's properties, and apply rules
  // related to their current values.
  for (let propertyName of Object.keys(entity.properties)) {
    let property = entity.properties[propertyName];
    let currentValue = property.currentValue;
    let rules = property.values[currentValue].rules;
    let children = property.values[currentValue].childEntities;

    // Apply rule for the property's current value.
    [property, messages] = 
      applyRules(rules, constants.KEY_NONE, property, 
        currentValue, 0);

    // Apply rule for the current values of the property's children.
    for (let childIndex in children) {

      // Apply the rules.
      let [childEntity, childMessage] = 
        executeRulesForCurrentValue(children[childIndex], recursion + 1);

      // Update the output.
      messages = messages.concat(childMessage);
      
      // Update the entity.
      property.values[currentValue].childEntities[childIndex] = childEntity;
    }

    entity.properties[propertyName] = property;
  }

  return [entity, messages];
}

/**
 * Apply the rules on a property.
 * @param {Object} rules The rules to execute.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Property} property The property that was acted upon.
 * @param {string} oldValue The previous value for the property.
 * @param {number} recursion To prevent infinite loops.
 * @returns {[Property, string[]]} The updated property and messages to output.
 */
function applyRules(rules, action, property, oldValue, recursion) {

  let messages = [];
  let whenMessages = [];
  let forMessages = [];

  if (recursion >= constants.MAX_RECURSION) {
    log.warn(errors.MAX_RECURSION);
    return [property, messages];
  }

  property = applyRuleValue(rules, property, oldValue);
  property = applyRuleDisable(rules, property);
  property = applyRuleEnable(rules, property);
  property = applyRuleActions(rules, property);
  messages = applyRuleMessage(rules, property);

  [property, whenMessages] = 
    applyRuleWhenBlock(rules, action, property, oldValue, recursion);

  [property, forMessages] = 
    applyRuleForBlock(rules, action, property, oldValue, recursion);

  messages = messages.concat(whenMessages).concat(forMessages);

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
    if (newValue === constants.KEY_REVERT) {
      property.currentValue = oldValue;
    } else if (newValue in property.values) {
      property.currentValue = newValue;
    } else {
      log.warn(errors.NOT_FOUND(newValue));
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
        log.warn(errors.NOT_FOUND(disableValue));
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
        log.warn(errors.NOT_FOUND(enableValue));
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
 * @returns {string[]} The updated messages for the property.
 */
function applyRuleMessage(rules, property) {

  let messages = [];

  if (constants.KEY_MESSAGE in rules) {
    let messageKey = rules[constants.KEY_MESSAGE];
    if (messageKey in property.messages) {
      let messageText = property.messages[messageKey];
      messages.push(messageText);
    } else {
      log.warn(errors.NOT_FOUND(messageKey));
    }
  }

  return messages;
}

/**
 * Conditional rule (when block) with contents to execute if true.
 * @param {Object} rules The rules to execute.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Property} property The property that was acted upon.
 * @param {string} oldValue The previous value for the property.
 * @param {number} recursion To prevent infinite loops.
 * @returns {[Property, string[]]} The updated property and messages to output.
 */
function applyRuleWhenBlock(rules, action, property, oldValue, recursion) {

  let messages = [];

  for (let trigger of Object.keys(rules)) {

    let words = trigger.split(' ');

    if (words.length > 1 && 
        words[0] == constants.KEY_WHEN) {

      let whenBlockRules = rules[trigger];
      let actionMessages = [];
      let propertyMessages = [];

      [property, actionMessages] = 
        applyRuleWhenAction(whenBlockRules, action, property, oldValue, 
          words, recursion);

      [property, propertyMessages] = 
        applyRuleWhenValue(whenBlockRules, action, property, oldValue, 
          words, recursion);

      messages = messages.concat(actionMessages).concat(propertyMessages);
    }
  }

  return [property, messages];
}

/**
 * Conditional rule (when block) with contents to execute if a specific 
 * action was done.
 * @param {Object} rules The rules to execute.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Property} property The property that was acted upon.
 * @param {string} oldValue The previous value for the property.
 * @param {string[]} words The words in the if statement.
 * @param {number} recursion To prevent infinite loops.
 * @returns {[Property, string[]]} The updated property and messages to output.
 */
function applyRuleWhenAction(rules, action, property, oldValue,
    words, recursion) {

  let messages = [];

  // To handle "when {action}:"
  if (words.length == 2 && 
      words[0] == constants.KEY_WHEN &&
      words[1] == action.name) {
        
    [property, messages] = 
      applyRules(rules, action, property, oldValue, recursion + 1);
  }

  return [property, messages];
}

/**
 * Conditional rule (when block) with contents to execute if a property 
 * has a specific value.
 * @param {Object} rules The rules to execute.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Property} property The property that was acted upon.
 * @param {string} oldValue The previous value for the property.
 * @param {string[]} words The words in the if statement.
 * @param {number} recursion To prevent infinite loops.
 * @returns {[Property, string[]]} The updated property and messages to output.
 */
function applyRuleWhenValue(rules, action, property, oldValue,
  words, recursion) {

  let messages = [];

  // To handle "when {property} is {value}:"
  if (words.length == 4 &&
      words[0] == constants.KEY_WHEN &&
      words[2] == constants.KEY_IS) {

    let targetPropertyPath = words[1];
    let targetValue = words[3];

    // Look at current property value, but also child entities of either
    // property value.
    let targetProperty = 
      getProperty.getPropertyByPath(property, targetPropertyPath);

    if (targetProperty != null && 
        targetProperty.currentValue == targetValue) {

      [property, messages] = 
        applyRules(rules, action, property, oldValue, recursion + 1);
    }
  }

  return [property, messages];
}

/**
 * Conditional rule (for block) with contents to execute if true.
 * @param {Object} rules The rules to execute.
 * @param {Action} action The action that triggered the rule execution.
 * @param {Property} property The property that was acted upon.
 * @param {string} oldValue The previous value for the property.
 * @param {number} recursion To prevent infinite loops.
 * @returns {[Property, string[]]} The updated property and messages to output.
 */
function applyRuleForBlock(rules, action, property, oldValue, recursion) {

  let messages = [];

  for (let trigger of Object.keys(rules)) {

    let words = trigger.split(' ');

    // To handle "for {property}:"
    if (words.length == 2 &&
        words[0] == constants.KEY_FOR) {

        let targetPropertyPath = words[1];
        let targetRules = rules[trigger];
        let executeMessages = [];

        // Get the property.
        let targetProperty = 
          getProperty.getPropertyByPath(property, targetPropertyPath);

        // Apply rules.
        if (targetProperty != null) {

          [targetProperty, executeMessages] = 
            applyRules(targetRules, action, targetProperty, 
              targetProperty.currentValue, recursion);

          property = 
            setProperty.setPropertyByPath(
              property, targetPropertyPath, targetProperty);
        }
        
        messages = messages.concat(executeMessages);
    }
  }

  return [property, messages];
}
