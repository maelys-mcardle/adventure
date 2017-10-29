'use strict';

module.exports = {
  list: getEligibleInputs,
  listExamples: getEligibleInputExamples
}

function getEligibleInputExamples(story) {
  return getPopulatedTemplates(story, true);
}

function getEligibleInputs(story) {
  return getPopulatedTemplates(story, false);
}

function getPopulatedTemplates(story, firstTemplateOnly) {
  let eligibleActions = getEligibleActions(story);
  let eligibleInputs = {};

  for (let eligibleActionName of Object.keys(eligibleActions)) {
    let eligibleAction = eligibleActions[eligibleActionName];
    for (let template of eligibleAction.action.templates) {
      let hasStateVariable = template.includes('@state');
      let hasEntityVariable = template.includes('@entity');
      let inputs = [];

      // template is: 
      //   action
      if (!hasEntityVariable && !hasStateVariable) {
        inputs = [template];

      // template is: 
      //   action @entity
      } else if (hasEntityVariable && !hasStateVariable) {
        inputs = inputsWithEntityTemplate(template, eligibleAction);

      // template is:
      //   action @state
      //   action @entity @state
      } else {
        inputs = inputsWithStateTemplate(template, eligibleAction);
      }

      eligibleInputs[eligibleActionName] = inputs;

      if (firstTemplateOnly) {
        break;
      }
    }
  }
  return eligibleInputs;
}

function inputsWithEntityTemplate(template, eligibleAction) {
  let validInputs = [];
  for (let entityName of Object.keys(eligibleAction.entities)) {
    let entity = eligibleAction.entities[entityName];
    let input = template.replace('@entity', entity.readableName);
    validInputs.push(input);
  }
  return validInputs;
}

function inputsWithStateTemplate(template, eligibleAction) {
  let validInputs = [];

  for (let entityName of Object.keys(eligibleAction.entities)) {
    let entity = eligibleAction.entities[entityName];
    let templateWithEntity = template.replace('@entity', entity.readableName);
    
    for (let valueName of Object.keys(entity.eligibleStateValues)) {
      let stateValue = entity.eligibleStateValues[valueName];
      let input = templateWithEntity.replace('@state', stateValue.readableName);
      validInputs.push(input);
    }
  }

  return validInputs;
}

/** Lists the actions that can be performed on the current state. */
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