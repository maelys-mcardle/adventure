'use strict';

const {EligibleInput, EligibleAction, EligibleActionEntity} =
  require('./inputclass');
const constants = require('../../constants');
const errors = require('../../errors');

module.exports = {
  listAll: getAllEligibleInputs,
  listExamples: getEligibleInputExamples
}

function getEligibleInputExamples(story) {
  return getEligibleInputs(story, true);
}

function getAllEligibleInputs(story) {
  return getEligibleInputs(story, false);
}

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

function getInputsWithTemplate(template, eligibleAction) {

  let validInputs = [];
  let hasPropertyVariable = template.includes('@value');
  let hasEntityVariable = template.includes('@entity');
  let eligibleActionEntitiesNames = Object.keys(eligibleAction.entities);

  if (eligibleActionEntitiesNames.length === 0) {
    return validInputs;
  } else if (!hasEntityVariable && eligibleActionEntitiesNames.length > 1) {
    console.log(errors.TEMPLATE_AMBIGUOUS(
      template, eligibleActionEntitiesNames.join(', ')));
    return validInputs;
  }

  for (let entityName of eligibleActionEntitiesNames) {
    let entity = eligibleAction.entities[entityName];
    let propertyValues = entity.eligiblePropertyValues;
    let propertyValueNames = Object.keys(propertyValues);
    let templateWithEntity = template.replace('@entity', entity.entityName);

    if (eligibleAction.action.changesPropertyValue) {
      if (propertyValueNames.length === 0) {
        continue;
      } else if (!hasPropertyVariable && propertyValueNames.length > 1) {
        console.log(errors.TEMPLATE_AMBIGUOUS(
          template, propertyValueNames.join(', ')));
        continue;
      }

      for (let propertyValueName of propertyValueNames) {
        let propertyValue = propertyValues[propertyValueName];
        let templateWithValue = 
          templateWithEntity.replace('@value', propertyValue.readableName);

        let eligibleInput =
          EligibleInputChangeValue(
            templateWithValue, eligibleAction, entity, propertyValueName);
        
        validInputs.push(eligibleInput);
      }
    }

    if (eligibleAction.action.describesEntityProperty) {
    
      let eligibleInput = 
        EligibleInputDescribeEntity(
          templateWithEntity, eligibleAction, entity);
      
      validInputs.push(eligibleInput);
    }
  }

  return validInputs;
}

function EligibleInputChangeValue(matchString, eligibleAction, entity, 
  propertyValueName) {

  let eligibleInput = new EligibleInput();
  eligibleInput.text = matchString;
  eligibleInput.actionName = eligibleAction.action.name;
  eligibleInput.entityName = entity.entityName;
  eligibleInput.entityPath = entity.entityPath;
  eligibleInput.propertyName = entity.propertyName;
  eligibleInput.propertyValueName = propertyValueName;
  return eligibleInput;
}

function EligibleInputDescribeEntity(matchString, eligibleAction, entity) {
  let eligibleInput = new EligibleInput();
  eligibleInput.text = matchString;
  eligibleInput.actionName = eligibleAction.action.name;
  eligibleInput.entityName = entity.entityName;
  eligibleInput.entityPath = entity.entityPath;
  eligibleInput.propertyName = entity.propertyName;
  return eligibleInput;
}

/** Lists the actions that can be performed on the current property, 
 * and the propertys and entities they can be performed on.
 */
function getEligibleActions(story) {

  let eligibleActions = 
    getEligibleActionsFromEntity({}, story.actions, story.rootEntity, 0);

  return eligibleActions;
}

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
          // Disabled propertys won't show up.
          // Only show enabled propertys.
          if (!value.disabled) {
            eligiblePropertyValues[value.name] = value;
          }
        } 
      }

      eligibleActions = addEligibleAction(eligibleActions, action,
        entity, propertyName, property.currentValue, eligiblePropertyValues);

      for (let childEntity of currentPropertyValue.childEntities) {
        eligibleActions = 
          getEligibleActionsFromEntity(eligibleActions, 
            actions, childEntity, recursion + 1);
      }
    }
  }

  return eligibleActions;
}

function addEligibleAction(eligibleActions, action, 
  entity, propertyName, currentPropertyValue, eligiblePropertyValues) {

  if (!(action.name in eligibleActions)) {
    eligibleActions[action.name] = new EligibleAction(action);
  }

  let eligibleEntity = new EligibleActionEntity(
    entity.name, entity.path, propertyName);

  eligibleEntity.eligiblePropertyValues = eligiblePropertyValues;
  eligibleEntity.currentPropertyValue = currentPropertyValue;
  eligibleActions[action.name].entities[entity.name] = eligibleEntity;

  return eligibleActions;
}
