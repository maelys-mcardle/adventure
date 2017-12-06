'use strict';

class EligibleInput {
  constructor() {
    this.text = null;
    this.action = null;
    this.target = {
      entity: null,
      path: null,
      property: null,
    };
    this.value = null;
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