'use strict';

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
    this.propertyName;
    this.propertyValueName;
  }
}

class EligibleAction {
  constructor(action) {
    this.action = action;
    this.entities = {};
  }
}

class EligibleActionEntity {
  constructor(entityName, entityPath, propertyName) {
    this.entityName = entityName;
    this.entityPath = entityPath;
    this.propertyName = propertyName;
    this.currentPropertyValue = null;
    this.eligiblePropertyValue = {};
  }
}

exports.MatchingInput = MatchingInput;
exports.EligibleInput = EligibleInput;
exports.EligibleAction = EligibleAction;
exports.EligibleActionEntity = EligibleActionEntity;