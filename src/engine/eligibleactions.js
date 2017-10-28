'use strict';

module.exports = {
  list: getEligibleActions,
  listExamples: getEligibleActionExamples
}

function getEligibleActionExamples(story) {
  let eligibleActions = getEligibleActions(story);
  let eligibleActionExamples = {};

  for (let eligibleActionName of Object.keys(eligibleActions)) {
    let eligibleAction = eligibleActions[eligibleActionName];
    if (eligibleAction.action.templates.length) {
      let template = eligibleAction.action.templates[0];
      let hasStateVariable = template.includes('@state');
      let hasEntityVariable = template.includes('@entity');
      let examples = [];

      // template is: 
      //   action
      if (!hasEntityVariable && !hasStateVariable) {
        examples.push(template);

      // template is: 
      //   action @entity
      } else if (hasEntityVariable && !hasStateVariable) {
        for (let eligibleEntity of Object.keys(eligibleAction.entities)) {
          let example = template.replace('@entity', 
            eligibleEntity.readableName);
          examples.push(example);
        }

      // template is:
      //   action @state
      //   action @entity @state
      } else {
        for (let eligibleEntity of Object.keys(eligibleAction.entities)) {
          let templateWithEntity = template.replace('@entity', 
            eligibleEntity.readableName);
          for (let eligibleStateValues of Object.keys(eligibleEntity)) {
            let example = templateWithEntity.replace('@state', 
              eligibleStateValues.readableName);
            examples.push(example);
          }
        }
      }

      eligibleActionExamples[eligibleAction] = examples;
    }
  }
  return eligibleActionExamples;
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