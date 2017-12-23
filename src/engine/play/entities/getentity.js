'use strict';

const constants = require('../../constants');
const errors = require('../../errors');

module.exports = {
  find: findEntity,
  findProperty: findProperty,
}

function findEntity(story, targetEntityName, targetEntityPath) {

  let foundEntity = getEntityByName(story.rootEntity, 
    targetEntityName, targetEntityPath);

  return foundEntity;
}

function findProperty(story, target) {

  let entityProperty = getPropertyByName(story.rootEntity, target);

  return entityProperty;
}

function getEntityByName(entity, targetEntityName, targetEntityPath,
  recursion) {

 if (recursion >= constants.MAX_RECURSION) {
   console.log(errors.MAX_RECURSION);
   return null;
 }

 // current entity matches.
 if (entity.name == targetEntityName && entity.path == targetEntityPath) {
   return entity;

 // search children.
 } else {
   for (let propertyName of Object.keys(entity.properties)) {
     let property = entity.properties[propertyName];
     let currentPropertyValue = property.values[property.currentValue];
     for (let childEntity of currentPropertyValue.childEntities) {
       let foundEntity = getEntityByName(childEntity,
         targetEntityName, targetEntityPath, recursion + 1);
       if (foundEntity != null) {
         return foundEntity;
       }
     }
   }
 }

 return null;
}

function getPropertyByName(rootEntity, target) {

  let entity = 
    getEntityByName(rootEntity, target.entity, target.path, 0);
  
  if (entity != null) {
    return entity.properties[target.property];
  }

  return null;
}
