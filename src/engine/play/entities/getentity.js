'use strict';

const constants = require('../../constants');
const errors = require('../../errors');
const log = require('../../log');

module.exports = {
  getEntity: getEntity,
}

/**
 * Gets the entity with the given target.
 * @param {Story} story The story object.
 * @param {Target} target The name/path for the entity.
 * @returns {Entity} The matching entity.
 */
function getEntity(story, target) {

  let entity = getEntityRecursive(story.rootEntity, target, 0);
  return entity;
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
   log.warn(errors.MAX_RECURSION);
   return null;
 }

 // current entity matches.
 if (entity.name == target.entity.name && 
     entity.path == target.entity.path) {
       
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