'use strict';

class EligibleInput {
  constructor() {
    this.text = null;
    this.action = null;
    this.target = new Target();
    this.value = null;
  }
}

class EligibleAction {
  constructor(action) {
    this.action = action;
    this.entities = {};
  }

  newEligibleEntity() {
    return new EligibleEntity();
  }

  addEligibleEntity(eligibleEntity) {
    this.entities[eligibleEntity.entityName] = eligibleEntity;
  }
}

class EligibleEntity {
  constructor() {
    this.target = new Target();
    this.currentValue = null;
    this.eligibleValues = {};
  }
}

/** This class specify's an entity's name, path, and property name. */
class Target {
  constructor() {
    this.entity = null;
    this.path = null;
    this.property = null;
  }
}

exports.EligibleInput = EligibleInput;
exports.EligibleAction = EligibleAction;