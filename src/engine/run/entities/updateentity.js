'use strict';

const constants = require('../../constants');

module.exports = {
  updateProperty: updateEntityProperty,
}

function updateEntityProperty(story, targetEntityName, targetEntityPath, 
  targetPropertyName, updatedProperty) {

  story.rootEntity = 
    updateEntityPropertyByName(
      story.rootEntity, targetEntityName, targetEntityPath, 
      targetPropertyName, updatedProperty, 0);

  return story;
}

function updateEntityPropertyByName(entity, targetEntityName, targetEntityPath, 
targetPropertyName, updatedProperty, recursion) {

  if (recursion >= constants.MAX_RECURSION) {
    console.log(contants.MAX_RECURSION_MESSAGE);
    return entity;
  }

  // current entity matches.
  if (entity.name == targetEntityName && entity.path == targetEntityPath) {
    entity.properties[targetPropertyName] = updatedProperty;

  // search children.
  } else {
    for (let propertyName of Object.keys(entity.properties)) {
      let property = entity.properties[propertyName];
      let currentPropertyValue = property.values[property.currentValue];
      for (let childEntityIndex in currentPropertyValue.childEntities) {
        let childEntity = currentPropertyValue.childEntities[childEntityIndex];
        
        let updatedChildEntity = updateEntityPropertyByName(childEntity,
          targetEntityName, targetEntityPath, 
          targetPropertyName, updatedProperty, recursion + 1);
        
        currentPropertyValue.childEntities[childEntityIndex] = updatedChildEntity;
      }
      entity.properties[propertyName].values[property.currentValue] = currentPropertyValue;
    }
  }

  return entity;
}