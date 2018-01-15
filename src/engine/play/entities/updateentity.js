'use strict';

const constants = require('../../constants');
const errors = require('../../errors');
const log = require('../../log');

module.exports = {
  updateProperty: updateProperty,
}

/**
 * Updates a property in the story.
 * @param {Story} story The story object.
 * @param {Target} target The name/path for the property's entity.
 * @param {Property} updatedProperty The updated property.
 * @returns {Story} The updated story.
 */
function updateProperty(story, target, updatedProperty) {

  story.rootEntity = 
    updatePropertyRecursive(story.rootEntity, target, updatedProperty, 0);

  return story;
}

/**
 * Updates a property in the story.
 * @param {Story} story The story object.
 * @param {Target} target The name/path for the property's entity.
 * @param {Property} updatedProperty The updated property.
 * @param {number} recursion Prevents infinite loops.
 * @returns {Story} The updated story.
 */
function updatePropertyRecursive(entity, target, updatedProperty, recursion) {

  if (recursion >= constants.MAX_RECURSION) {
    log.warn(errors.MAX_RECURSION);
    return entity;
  }

  // See if current entity matches.
  // If it does, update the property.
  if (entity.name == target.entity && entity.path == target.path) {
    
    entity.properties[target.property] = updatedProperty;

  // If the current entity does not match, search its children.
  } else {

    for (let propertyName of Object.keys(entity.properties)) {
      let property = entity.properties[propertyName];
      let currentValue = property.values[property.currentValue];
      for (let childEntityIndex in currentValue.childEntities) {

        let childEntity = currentValue.childEntities[childEntityIndex];
        let updatedChildEntity = updatePropertyRecursive(childEntity,
          target, updatedProperty, recursion + 1);

        currentValue.childEntities[childEntityIndex] = updatedChildEntity;
      }

      entity.properties[propertyName].values[property.currentValue] = 
        currentValue;
    }
  }

  return entity;
}