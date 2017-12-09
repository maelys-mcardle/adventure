'use strict';

class EligibleInput {
  constructor() {
    this.text = null;
    this.action = null;
    this.target = new Target();
    this.value = null;
  }
}

class Target {
  constructor() {
    this.entity = null;
    this.path = null;
    this.property = null;
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
    this.entityName = null;
    this.entityPath = null;
    this.propertyName = null;
    this.currentPropertyValue = null;
    this.eligiblePropertyValue = {};
  }
}

exports.EligibleInput = EligibleInput;
exports.EligibleAction = EligibleAction;