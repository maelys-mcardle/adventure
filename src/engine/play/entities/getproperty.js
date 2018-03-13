'use strict';

const getEntity = require('./getentity');
const constants = require('../../constants');
const errors = require('../../errors');
const log = require('../../log');

module.exports = {
  getProperty: getProperty,
  getPropertyByPath: getPropertyByPath,
}

/**
 * Gets the property with the given target.
 * @param {Story} story The story object.
 * @param {Target} target The name for the property and its entity.
 * @returns {Property} The matching property.
 */
function getProperty(story, target) {

  let entity = getEntity.getEntity(story, target);
  let property = null;
  
  if (entity != null) {
    property = entity.properties[target.property.name];
  }

  return property;
}

/**
 * Gets the entity with the given target.
 * @param {Property} property The top-level property.
 * @param {string} targetProperty The partial path of the child property.
 * @returns {Property} The matching child property.
 */
function getPropertyByPath(property, targetProperty) {

  let childProperty = 
    getPropertyByPathRecursive(property, '', targetProperty, 0);
  
  return childProperty;
}

/**
 * Determines if a property has a specific value.
 * @param {Property} property The current property.
 * @param {string} propertyPrefix The path to the current property.
 * @param {string} targetProperty The partial path of the child property.
 * @param {number} recursion To prevent infinite loops.
 * @returns {bool} True if the target property has the target value.
 */
function getPropertyByPathRecursive(property, propertyPrefix, 
  targetProperty, recursion)
{
  // property can be:
  //  property
  //  property.childEntity.childProperty
  //  property.childEntity.childProperty.[..].childProperty

  if (recursion >= constants.MAX_RECURSION) {
    log.warn(errors.MAX_RECURSION);
    return null;
  }

  let currentPropertyName = propertyPrefix + property.name;
  if (currentPropertyName.endsWith(targetProperty)) {
    return property;
  } else {
    for (let value of Object.keys(property.values)) {
      for (let childEntity of property.values[value].childEntities) {

        let prefix = childEntity.path + constants.PATH_SEP + 
          childEntity.name + constants.PATH_SEP;

        for (let propertyName of Object.keys(childEntity.properties)) {
          let childProperty = childEntity.properties[propertyName];
          if (getPropertyByPathRecursive(childProperty, prefix, 
              targetProperty, recursion + 1) != null) {
            return childProperty;
          }
        }
      }
    }
  }

  return null;
}