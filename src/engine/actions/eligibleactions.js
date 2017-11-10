'use strict';

const stringSimilarity = require('string-similarity');

const constants = require('../../constants');

module.exports = {
  matchInput: matchInputToAction,
  listAll: getAllEligibleInputs,
  listExamples: getEligibleInputExamples
}

/** Matches user input to an action. */
function matchInputToAction(story, input) {

  let matchingInput = new MatchingInput();
  let eligibleInputs = getAllEligibleInputs(story, input);

  let bestMatch = stringSimilarity.findBestMatch(input.trim(),
    eligibleInputs.map(i => i.text)).bestMatch;

  if (bestMatch.rating > 0.9) {
    for (let eligibleAction of eligibleInputs) {
      if (bestMatch.target === eligibleAction.text) {
        matchingInput.match = eligibleAction;
        matchingInput.hasMatch = true;
        matchingInput.isExactMatch = bestMatch.rating === 1.0;
        break;
      }
    }
  } else if (bestMatch.rating > 0.5) {
    matchingInput.suggestion = bestMatch.target;
    matchingInput.hasSuggestion = true;
  }

  return matchingInput;
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
    let templateWithEntity = template.replace('@entity', entity.entityName);

    if (eligibleAction.action.changesStateValue) {
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

        let eligibleInput =
          EligibleInputChangeState(
            templateWithState, eligibleAction, entity, stateValueName);
        
        validInputs.push(eligibleInput);
      }
    }

    if (eligibleAction.action.describesEntityState) {
    
      let eligibleInput = 
        EligibleInputDescribeEntity(
          templateWithEntity, eligibleAction, entity);
      
      validInputs.push(eligibleInput);
    }
  }

  return validInputs;
}

function EligibleInputChangeState(matchString, eligibleAction, entity, 
  stateValueName) {

  let eligibleInput = new EligibleInput();
  eligibleInput.text = matchString;
  eligibleInput.actionName = eligibleAction.action.name;
  eligibleInput.entityName = entity.entityName;
  eligibleInput.entityPath = entity.entityPath;
  eligibleInput.stateName = entity.stateName;
  eligibleInput.stateValueName = stateValueName;
  return eligibleInput;
}

function EligibleInputDescribeEntity(matchString, eligibleAction, entity) {
  let eligibleInput = new EligibleInput();
  eligibleInput.text = matchString;
  eligibleInput.actionName = eligibleAction.action.name;
  eligibleInput.entityName = entity.entityName;
  eligibleInput.entityPath = entity.entityPath;
  eligibleInput.stateName = entity.stateName;
  return eligibleInput;
}

/** Lists the actions that can be performed on the current state, 
 * and the states and entities they can be performed on.
 */
function getEligibleActions(story) {
  let eligibleActions = {};

  for (let entity of story.currentState) {
    let entityActions = getEligibleActionsFromEntity(story.actions, entity, 0);
    eligibleActions = Object.assign(eligibleActions, entityActions);
  }

  return eligibleActions;
}

function getEligibleActionsFromEntity(actions, entity, recursion) {
  let eligibleActions = {};

  if (recursion >= constants.MAX_RECURSION) {
    console.log('Maximum recursion depth exceeded.');
    return eligibleActions;
  }

  for (let stateName of Object.keys(entity.states)) {
    let state = entity.states[stateName];
    for (let actionName of state.actions) {
      let action = actions[actionName];
      let currentStateValue = state.values[state.currentValue];
      let eligibleStateValuesNames = 
        Object.keys(currentStateValue.relationships);
      let eligibleStateValues = {};

      // Action for changing the state value.
      if (action.changesStateValue) {
        for (let valueName of eligibleStateValuesNames) {
          let value = state.values[valueName];
          // Disabled states won't show up.
          // Only show enabled states.
          if (!value.disabled) {
            eligibleStateValues[value.name] = value;
          }
        } 
      }

      eligibleActions = addEligibleAction(eligibleActions, action,
        entity, stateName, state.currentValue, eligibleStateValues);

      for (let childEntity of currentStateValue.childEntities) {

        let childActions = 
          getEligibleActionsFromEntity(actions, childEntity, recursion + 1);
        
        eligibleActions = Object.assign(eligibleActions, childActions);
      }
    }
  }

  return eligibleActions;
}

function addEligibleAction(eligibleActions, action, 
  entity, stateName, currentStateValue, eligibleStateValues) {

  eligibleActions[action.name] = new EligibleAction(action);

  let eligibleEntity = new EligibleActionEntity(
    entity.name, entity.path, stateName);

  eligibleEntity.eligibleStateValues = eligibleStateValues;
  eligibleEntity.currentStateValue = currentStateValue;
  eligibleActions[action.name].entities[entity.name] = eligibleEntity;

  return eligibleActions;
}

class MatchingInput {
  constructor() {
    this.match;
    this.hasMatch = false;
    this.isExactMatch = false;
    this.hasSuggestion = false;
    this.suggestion = '';
  }
}

class EligibleInput {
  constructor() {
    this.text;
    this.actionName;
    this.entityName;
    this.entityPath;
    this.stateName;
    this.stateValueName;
  }
}

class EligibleAction {
  constructor(action) {
    this.action = action;
    this.entities = {};
  }
}

class EligibleActionEntity {
  constructor(entityName, entityPath, stateName) {
    this.entityName = entityName;
    this.entityPath = entityPath;
    this.stateName = stateName;
    this.currentStateValue = null;
    this.eligibleStateValue = {};
  }
}