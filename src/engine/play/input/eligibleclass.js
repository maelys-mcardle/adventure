'use strict';

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

  newEligibleEntity() {
    return new EligibleActionEntity();
  }

  addEligibleEntity(eligibleEntity) {
    this.entities[eligibleEntity.entityName] = eligibleEntity;
  }
}

class EligibleActionEntity {
  constructor() {
    this.entityName = '';
    this.entityPath = '';
    this.propertyName = '';
    this.currentPropertyValue = null;
    this.eligiblePropertyValue = {};
  }
}

exports.EligibleInput = EligibleInput;
exports.EligibleAction = EligibleAction;