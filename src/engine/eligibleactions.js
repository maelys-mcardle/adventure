'use strict';

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
  let hasStateVariable = template.includes('@state');
  let hasEntityVariable = template.includes('@entity');
  let eligibleActionEntitiesNames = Object.keys(eligibleAction.entities);

  if (eligibleActionEntitiesNames.length === 0) {
    return validInputs;
  } else if (!hasEntityVariable && eligibleActionEntitiesNames.length > 1) {
    console.log(template + " is ambiguous and can refer to: " + 
      eligibleActionEntitiesNames.join(', '));
    return validInputs;
  }

  for (let entityName of eligibleActionEntitiesNames) {
    let entity = eligibleAction.entities[entityName];
    let stateValues = entity.eligibleStateValues;
    let stateValueNames = Object.keys(stateValues);
    let templateWithEntity = template.replace('@entity', entity.readableName);

    if (stateValueNames.length === 0) {
      continue;
    } else if (!hasStateVariable && stateValueNames.length > 1) {
      console.log(template + " is ambiguous and can refer to: " + 
        stateValueNames.join(', '));
      continue;
    }

    for (let stateValueName of stateValueNames) {
      let stateValue = stateValues[stateValueName];
      let templateWithState = 
        templateWithEntity.replace('@state', stateValue.readableName);

      let eligibleInput = new EligibleInput();
      eligibleInput.text = templateWithState;
      eligibleInput.action = eligibleAction.action.name;
      eligibleInput.entity = entity.entityName;
      eligibleInput.state = entity.stateName;
      eligibleInput.stateValue = stateValueName;
      
      validInputs.push(eligibleInput);
    }
  }

  return validInputs;
}

/** Lists the actions that can be performed on the current state, 
 * and the states and entities they can be performed on.
 */
function getEligibleActions(story) {
  let eligibleActions = {};

  for (let entity of story.currentState) {
    for (let stateName of Object.keys(entity.states)) {
      let state = entity.states[stateName];
      for (let actionName of state.actions) {
        let currentStateValue = state.values[state.currentValue];
        let eligibleStateValuesNames = Object.keys(currentStateValue.relationships);
        let eligibleStateValues = {};

        for (let valueName of eligibleStateValuesNames) {
          let value = state.values[valueName];
          eligibleStateValues[value.name] = value;
        }

        eligibleActions = addEligibleAction(eligibleActions, story.actions, 
          actionName, entity.name, stateName, currentStateValue.name, 
          eligibleStateValues);
      }
    }
  }

  return eligibleActions;
}

function addEligibleAction(eligibleActions, actions, actionName, entityName, 
  stateName, currentStateValue, eligibleStateValues) {

  if (!(actionName in eligibleActions)) {
    let action = actions[actionName];
    eligibleActions[actionName] = new EligibleAction(action);
  }

  if (!(entityName in eligibleActions[actionName].entities)) {
    let eligibleEntity = new EligibleActionEntity(entityName, stateName);
    eligibleEntity.eligibleStateValues = eligibleStateValues;
    eligibleEntity.currentStateValue = currentStateValue;
    eligibleActions[actionName].entities[entityName] = eligibleEntity;
  }

  return eligibleActions;
}

class EligibleInput {
  constructor() {
    this.text;
    this.action;
    this.entity;
    this.state;
    this.stateValue;
  }
}

class EligibleAction {
  constructor(action) {
    this.action = action;
    this.entities = {};
  }
}

class EligibleActionEntity {
  constructor(entityName, stateName) {
    this.entityName = entityName;
    this.stateName = stateName;
    this.currentStateValue = null;
    this.eligibleStateValues = {};
  }
}