'use strict';

const constants = require('../../constants');
const errors = require('../../errors');

module.exports = {
  find: findEntity,
  findProperty: findEntityProperty,
}

function findEntity(story, targetEntityName, targetEntityPath) {

  let foundEntity = getEntityByName(story.rootEntity, 
    targetEntityName, targetEntityPath);

  return foundEntity;
}

function findEntityProperty(story, targetEntityName, targetEntityPath, 
  targetPropertyName) {

  let entityProperty = getEntityPropertyByName(story.rootEntity, 
    targetEntityName, targetEntityPath, targetPropertyName);

  return entityProperty;
}

function getEntityPropertyByName(rootEntity, targetEntityName, targetEntityPath, 
  targetPropertyName) {

  let entity = 
    getEntityByName(rootEntity, targetEntityName, targetEntityPath, 0);
  
  if (entity != null) {
    return entity.properties[targetPropertyName];
  }

  return null;
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
