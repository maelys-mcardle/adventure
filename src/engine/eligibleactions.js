'use strict';

module.exports = {
  list: getEligibleActions
}

/** Lists the actions that can be performed on the current state. */
function getEligibleActions(actions, currentState) {
  let eligibleActions = {};

  for (let entity of currentState) {
    for (let stateName of Object.keys(entity.states)) {
      let state = entity.states[stateName];
      for (let actionName of state.actions) {
        let currentStateValue = state.values[state.currentValue];
        let eligibleStateValues = Object.keys(currentStateValue.relationships);
        eligibleActions = addEligibleAction(eligibleActions, actions, 
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
    this.eligibleStateValues = [];
  }
}