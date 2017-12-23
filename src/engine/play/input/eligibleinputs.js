'use strict';

const {EligibleInput, EligibleAction} = require('./eligibleclass');
const constants = require('../../constants');
const errors = require('../../errors');

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
  let hasPropertyVariable = template.includes('@value');
  let hasEntityVariable = template.includes('@entity');
  let eligibleEntitiesNames = Object.keys(eligibleAction.entities);

  if (eligibleEntitiesNames.length === 0) {
    return validInputs;
  } else if (!hasEntityVariable && eligibleEntitiesNames.length > 1) {
    console.log(errors.TEMPLATE_AMBIGUOUS(
      template, eligibleEntitiesNames.join(', ')));
    return validInputs;
  }

  for (let entityName of eligibleEntitiesNames) {
    let eligibleEntity = eligibleAction.entities[entityName];
    let templateWithEntity = 
      template.replace('@entity', eligibleEntity.target.entity);

    let values = eligibleEntity.eligibleValues;
    let valueNames = Object.keys(values);

    if (eligibleAction.action.changesPropertyValue) {
      if (valueNames.length === 0) {
        continue;
      } else if (!hasPropertyVariable && valueNames.length > 1) {
        console.log(errors.TEMPLATE_AMBIGUOUS(template, valueNames.join(', ')));
        continue;
      }

      for (let valueName of valueNames) {
        let value = values[valueName];
        let templateWithValue = 
          templateWithEntity.replace('@value', value.readableName);

        let eligibleInput =
          getEligibleInput(
            templateWithValue, eligibleAction, eligibleEntity, valueName);
        
        validInputs.push(eligibleInput);
      }
    }

    if (eligibleAction.action.describesEntityProperty) {
    
      let eligibleInput = 
        getEligibleInput(templateWithEntity, eligibleAction, 
          eligibleEntity, null);
      
      validInputs.push(eligibleInput);
    }
  }

  return validInputs;
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
    console.log(errors.MAX_RECURSION);
    return eligibleActions;
  }

  for (let propertyName of Object.keys(entity.properties)) {
    let property = entity.properties[propertyName];
    for (let actionName of property.actions) {
      let action = actions[actionName];
      let currentPropertyValue = property.values[property.currentValue];
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
        entity, propertyName, eligiblePropertyValues, property.currentValue);

      for (let childEntity of currentPropertyValue.childEntities) {
        eligibleActions = 
          getEligibleActionsFromEntity(eligibleActions, 
            actions, childEntity, recursion + 1);
      }
    }
  }

  return eligibleActions;
}

/**
 * Add the action to eligible actions.
 * @param {Object} eligibleActions The eligible actions.
 * @param {Action} action The actions to add.
 * @param {Entity} entity The entity to add the action for.
 * @param {string} propertyName The property to add the action for.
 * @param {string[]} eligibleValues All eligible values for the property.
 * @param {string} currentValue The current value for the property.
 * @returns {Object} The eligible actions.
 */
function addEligibleAction(eligibleActions, action, 
  entity, propertyName, eligibleValues, currentValue) {

  if (!(action.name in eligibleActions)) {
    eligibleActions[action.name] = new EligibleAction(action);
  }

  let eligibleAction = eligibleActions[action.name];
  let eligibleEntity = eligibleAction.newEligibleEntity();

  eligibleEntity.target.entity = entity.name;
  eligibleEntity.target.path = entity.path;
  eligibleEntity.target.property = propertyName;
  eligibleEntity.eligibleValues = eligibleValues;
  eligibleEntity.currentValue = currentValue;

  eligibleAction.addEligibleEntity(eligibleEntity);
  eligibleActions[action.name] = eligibleAction;

  return eligibleActions;
}
