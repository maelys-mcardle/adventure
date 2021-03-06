'use strict';

const {EligibleInput, EligibleAction} = require('./eligibleclass');
const constants = require('../../constants');
const errors = require('../../errors');
const log = require('../../log');

module.exports = {
  listAll: getAllEligibleInputs,
  listExamples: getEligibleInputExamples
}

/**
 * Returns a list of all eligible inputs.
 * @param {Story} story The story object.
 * @returns {EligibleInput[]} The eligible inputs.
 */
function getAllEligibleInputs(story) {
  let eligibleInputs = getEligibleInputs(story, false);
  return eligibleInputs;
}

/**
 * Returns a list of all eligible inputs - limited to one per action/property.
 * @param {Story} story The story object.
 * @returns {EligibleInput[]} The eligible inputs.
 */
function getEligibleInputExamples(story) {
  let eligibleInputs = getEligibleInputs(story, true);
  return eligibleInputs;
}

/**
 * Returns a list of all eligible inputs.
 * @param {Story} story The story object.
 * @param {bool} firstTemplateOnly Limit to one template per action/property.
 * @returns {EligibleInput[]} The eligible inputs.
 */
function getEligibleInputs(story, firstTemplateOnly) {
  let eligibleActions = getEligibleActions(story);
  let eligibleInputs = [];

  for (let eligibleActionName of Object.keys(eligibleActions)) {
    let eligibleAction = eligibleActions[eligibleActionName];
    for (let template of eligibleAction.action.templates) {
      let inputs = getInputsWithTemplate(template, eligibleAction);
      eligibleInputs = eligibleInputs.concat(inputs);

      if (firstTemplateOnly) {
        break;
      }
    }
  }

  return eligibleInputs;
}

/**
 * Get all eligible inputs for a specified template.
 * @param {string} template The template.
 * @param {EligibleAction} eligibleAction The action for the template.
 * @returns {EligibleInput[]} All eligible inputs.
 */
function getInputsWithTemplate(template, eligibleAction) {

  let validInputs = [];

  if (eligibleAction.entities.length === 0) {
    return validInputs;
  }

  for (let eligibleEntity of eligibleAction.entities) {

    let hasValuePlaceholder = 
      template.includes(constants.KEY_VALUE_PLACEHOLDER);
    let hasPropertyPlaceholder = 
      template.includes(constants.KEY_PROPERTY_PLACEHOLDER);
    let hasEntityPlaceholder = 
      template.includes(constants.KEY_ENTITY_PLACEHOLDER);
      
    let templateWithEntity = 
      replacePlaceholder(template, 
        constants.KEY_ENTITY_PLACEHOLDER, 
        eligibleEntity.target.entity.name);
    
    let templateWithProperty = 
      replacePlaceholder(templateWithEntity, 
        constants.KEY_PROPERTY_PLACEHOLDER, 
        eligibleEntity.target.property.readableName);

    let values = eligibleEntity.eligibleValues;
    let valueNames = Object.keys(values);

    if (eligibleAction.action.changesPropertyValue) {

      if (valueNames.length === 0) {
        continue;
      }

      for (let valueName of valueNames) {
        let value = values[valueName];
        let templateWithValue = 
          replacePlaceholder(templateWithProperty, 
            constants.KEY_VALUE_PLACEHOLDER, 
            value.readableName);

        let eligibleInput =
          getEligibleInput(
            templateWithValue, eligibleAction, eligibleEntity, valueName);
        
        validInputs = 
          addUniqueInput(validInputs, eligibleInput, templateWithValue);
      }
    }

    if (eligibleAction.action.describesPropertyValue) {
    
      let eligibleInput = 
        getEligibleInput(templateWithProperty, eligibleAction, 
          eligibleEntity, null);
      
      validInputs = 
        addUniqueInput(validInputs, eligibleInput, templateWithProperty);
    }
  }

  return validInputs;
}

/**
 * Add an input to a list of inputs.
 * @param {string[]} inputs The list of all inputs.
 * @param {string} input A single input to add.
 * @returns {string[]} The list of all inputs.
 */
function addUniqueInput(inputs, input, template) {

  if (inputs.includes(input)) {
    log.warn(errors.TEMPLATE_AMBIGUOUS(template));
  } else {
    inputs.push(input);
  }
  
  return inputs;
}

/**
 * Generate an eligible input.
 * @param {string} input The input string to match.
 * @param {EligibleAction} eligibleAction The action for the input.
 * @param {EligibleEntity} eligibleEntity The entity for the input.
 * @param {string} value The value to transition to for the input. 
 * @returns {EligibleInput} The eligible input.
 */
function getEligibleInput(input, eligibleAction, eligibleEntity, value) {

  let eligibleInput = new EligibleInput();
  eligibleInput.text = input;
  eligibleInput.action = eligibleAction.action.name;
  eligibleInput.target = eligibleEntity.target;
  eligibleInput.value = value;
  return eligibleInput;
}

/**
 * Lists the actions that can be performed on the story.
 * @param {Story} story The story object.
 * @returns {EligibleAction[]} The eligible actions.
 */
function getEligibleActions(story) {

  let eligibleActions = 
    getEligibleActionsFromEntity({}, story.actions, story.rootEntity, 0);

  return eligibleActions;
}

/**
 * Lists the actions that can be performed on the story.
 * @param {Object} eligibleActions The eligible actions.
 * @param {Object} actions The actions for the story.
 * @param {Entity} entity The entity to get the eligible actions for.
 * @param {number} recursion prevent infinite loops.
 * @returns {Object} The eligible actions.
 */
function getEligibleActionsFromEntity(eligibleActions, 
  actions, entity, recursion) {

  if (recursion >= constants.MAX_RECURSION) {
    log.warn(errors.MAX_RECURSION);
    return eligibleActions;
  }

  for (let propertyName of Object.keys(entity.properties)) {
    let property = entity.properties[propertyName];
    let currentPropertyValue = property.values[property.currentValue];
    
    for (let actionName of property.actions) {
      let action = actions[actionName];
      let eligiblePropertyValuesNames = 
        Object.keys(currentPropertyValue.relationships);
      let eligiblePropertyValues = {};

      // Action for changing the property value.
      if (action.changesPropertyValue) {
        for (let valueName of eligiblePropertyValuesNames) {
          let value = property.values[valueName];
          // Disabled properties won't show up.
          // Only show enabled properties.
          if (!value.disabled) {
            eligiblePropertyValues[value.name] = value;
          }
        } 
      }

      eligibleActions = addEligibleAction(eligibleActions, action,
        entity, property, eligiblePropertyValues, property.currentValue);
    }

    for (let childEntity of currentPropertyValue.childEntities) {
      eligibleActions = 
        getEligibleActionsFromEntity(eligibleActions, 
          actions, childEntity, recursion + 1);
    }
  }

  return eligibleActions;
}

/**
 * Add the action to eligible actions.
 * @param {Object} eligibleActions The eligible actions.
 * @param {Action} action The actions to add.
 * @param {Entity} entity The entity to add the action for.
 * @param {Property} property The property to add the action for.
 * @param {string[]} eligibleValues All eligible values for the property.
 * @param {string} currentValue The current value for the property.
 * @returns {Object} The eligible actions.
 */
function addEligibleAction(eligibleActions, action, 
  entity, property, eligibleValues, currentValue) {

  if (!(action.name in eligibleActions)) {
    eligibleActions[action.name] = new EligibleAction(action);
  }

  let eligibleAction = eligibleActions[action.name];
  let eligibleEntity = eligibleAction.newEligibleEntity();

  eligibleEntity.target.entity = entity;
  eligibleEntity.target.property = property;
  eligibleEntity.eligibleValues = eligibleValues;
  eligibleEntity.currentValue = currentValue;

  eligibleAction.addEligibleEntity(eligibleEntity);
  eligibleActions[action.name] = eligibleAction;

  return eligibleActions;
}

/**
 * Replaces a placeholder with a substitute.
 * @param {string} text The word containing the placeholder.
 * @param {string} placeholder The placeholder.
 * @param {string} substitute A replacement for the placeholder.
 * @returns {string} The text with the placeholder replaced.
 */
function replacePlaceholder(text, placeholder, substitute) {
  return text.replace(placeholder, substitute);
}

