'use strict';

const constants = require('../../constants');
const errors = require('../../errors');

module.exports = {
  findEntity: findEntity,
  findProperty: findProperty,
}

/**
 * Gets the entity with the given target.
 * @param {Story} story The story object.
 * @param {Target} target The name/path for the entity.
 * @returns {Entity} The matching entity.
 */
function findEntity(story, target) {

  let entity = getEntityRecursive(story.rootEntity, target, 0);
  return entity;
}

/**
 * Gets the property with the given target.
 * @param {Story} story The story object.
 * @param {Target} target The name for the property and its entity.
 * @returns {Property} The matching property.
 */
function findProperty(story, target) {

  let entity = findEntity(story, target);
  let property = null;
  
  if (entity != null) {
    property = entity.properties[target.property];
  }

  return property;
}

/**
 * Gets the entity with the given target.
 * @param {Story} story The story object.
 * @param {Target} target The name/path for the entity.
 * @param {number} recursion Prevents infinite loops.
 * @returns {Entity} The matching entity.
 */
function getEntityRecursive(entity, target, recursion) {

 if (recursion >= constants.MAX_RECURSION) {
   console.log(errors.MAX_RECURSION);
   return null;
 }

 // current entity matches.
 if (entity.name == target.entity && entity.path == target.path) {
   return entity;

 // search children.
 } else {
   for (let propertyName of Object.keys(entity.properties)) {
     let property = entity.properties[propertyName];
     let currentValue = property.values[property.currentValue];
     for (let childEntity of currentValue.childEntities) {
       let foundEntity = getEntityRecursive(childEntity, target, recursion + 1);
       if (foundEntity != null) {
         return foundEntity;
       }
     }
   }
 }

 return null;
}