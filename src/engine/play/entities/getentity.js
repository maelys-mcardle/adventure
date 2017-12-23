'use strict';

const constants = require('../../constants');
const errors = require('../../errors');

module.exports = {
  findEntity: findEntity,
  findProperty: findProperty,
}

function findEntity(story, target) {

  let foundEntity = getEntityByName(story.rootEntity, target);

  return foundEntity;
}

function findProperty(story, target) {

  let entityProperty = getPropertyByName(story.rootEntity, target);

  return entityProperty;
}

function getEntityByName(entity, target, recursion) {

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
       let foundEntity = getEntityByName(childEntity, target, recursion + 1);
       if (foundEntity != null) {
         return foundEntity;
       }
     }
   }
 }

 return null;
}

function getPropertyByName(rootEntity, target) {

  let entity = getEntityByName(rootEntity, target, 0);
  
  if (entity != null) {
    return entity.properties[target.property];
  }

  return null;
}
