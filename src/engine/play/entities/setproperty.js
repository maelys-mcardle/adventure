'use strict';

const constants = require('../../constants');
const errors = require('../../errors');
const log = require('../../log');

module.exports = {
  setProperty: setProperty,
  setPropertyByPath: setPropertyByPath,
}

/**
 * Updates a property in the story.
 * @param {Story} story The story object.
 * @param {Target} target The name/path for the property's entity.
 * @param {Property} updatedProperty The updated property.
 * @returns {Story} The updated story.
 */
function setProperty(story, target, updatedProperty) {

  story.rootEntity = 
    setPropertyRecursive(story.rootEntity, target, updatedProperty, 0);

  return story;
}

/**
 * Updates a property in an entity.
 * @param {Entity} entity The top-level entity.
 * @param {Target} target The name/path for the property's entity.
 * @param {Property} updatedProperty The updated property.
 * @param {number} recursion Prevents infinite loops.
 * @returns {Entity} The updated entity.
 */
function setPropertyRecursive(entity, target, updatedProperty, recursion) {

  if (recursion >= constants.MAX_RECURSION) {
    log.warn(errors.MAX_RECURSION);
    return entity;
  }

  // See if current entity matches.
  // If it does, update the property.
  if (entity.name == target.entity.name && 
      entity.path == target.entity.path) {
    
    entity.properties[target.property.name] = updatedProperty;

  // If the current entity does not match, search its children.
  } else {

    for (let propertyName of Object.keys(entity.properties)) {
      let property = entity.properties[propertyName];
      let currentValue = property.values[property.currentValue];
      for (let childEntityIndex in currentValue.childEntities) {

        let childEntity = currentValue.childEntities[childEntityIndex];
        let updatedChildEntity = setPropertyRecursive(childEntity,
          target, updatedProperty, recursion + 1);

        currentValue.childEntities[childEntityIndex] = updatedChildEntity;
      }

      entity.properties[propertyName].values[property.currentValue] = 
        currentValue;
    }
  }

  return entity;
}

/**
 * Gets the entity with the given target.
 * @param {Property} property The top-level property.
 * @param {string} targetPropertyPath The partial path of the child property.
 * @param {Property} targetProperty The property to set for the child.
 * @returns {Property} The updated top-level property.
 */
function setPropertyByPath(property, targetPropertyPath, targetProperty) {
  return setPropertyByPathRecursive(property, '', targetPropertyPath,
    targetProperty, 0);
}

/**
 * Execute rules for specified child property.
 * @param {Property} property The current property.
 * @param {string} propertyPrefix The path to the current property.
 * @param {string} targetPropertyPath The partial path of the child property.
 * @param {Property} targetProperty The property to set for the child.
 * @param {number} recursion To prevent infinite loops.
 * @returns {Property} The updated top-level property.
 */
function setPropertyByPathRecursive(property, 
  propertyPrefix, targetPropertyPath, targetProperty, recursion)
{
  // property can be:
  //  property
  //  property.childEntity.childProperty
  //  property.childEntity.childProperty.[..].childProperty

  if (recursion >= constants.MAX_RECURSION) {
    log.warn(errors.MAX_RECURSION);
    return property;
  }

  let currentPropertyName = propertyPrefix + property.name;
  if (currentPropertyName.endsWith(targetProperty)) {
    
    property = targetProperty;

  } else {
    for (let value of Object.keys(property.values)) {
      for (let childEntityIndex in property.values[value].childEntities) {

        let childEntity = 
          property.values[value].childEntities[childEntityIndex];
        
        let prefix = childEntity.path + constants.PATH_SEP + 
          childEntity.name + constants.PATH_SEP;

        for (let propertyName of Object.keys(childEntity.properties)) {

          let childProperty = childEntity.properties[propertyName];

          childProperty = setPropertyByPathRecursive(
            childProperty, prefix, targetPropertyPath, targetProperty, 
            recursion + 1);

          childEntity.properties[propertyName] = childProperty;
        }

        property.values[value].childEntities[childEntityIndex] = childEntity;
      }
    }
  }

  return property;
}