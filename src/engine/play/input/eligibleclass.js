'use strict';

/** Class to store an eligible input. */
class EligibleInput {
  constructor() {
    this.text = null;
    this.action = null;
    this.target = new Target();
    this.value = null;
  }
}

/** Class to store an eligible action. */
class EligibleAction {
  constructor(action) {
    this.action = action;
    this.entities = {};
  }

  /**
   * Instantiates a new eligible entity.
   * @returns {EligibleEntity} An instantiated eligible entity.
   */
  newEligibleEntity() {
    return new EligibleEntity();
  }

  /**
   * Adds the eligible entity to the action.
   * @param {EligibleEntity} eligibleEntity 
   * @returns {undefined}
   */
  addEligibleEntity(eligibleEntity) {
    this.entities[eligibleEntity.entityName] = eligibleEntity;
  }
}

/** This class stores an eligible entity. */
class EligibleEntity {
  constructor() {
    this.target = new Target();
    this.currentValue = null;
    this.eligibleValues = {};
  }
}

/** This class specify's an entity and its property. */
class Target {
  constructor() {
    this.entity = null;
    this.property = null;
  }
}

exports.EligibleInput = EligibleInput;
exports.EligibleAction = EligibleAction;