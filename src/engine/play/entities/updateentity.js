'use strict';

const constants = require('../../constants');
const errors = require('../../errors');

module.exports = {
  updateProperty: updateEntityProperty,
}

function updateEntityProperty(story, target, updatedProperty) {

  story.rootEntity = 
    updateEntityPropertyByName(story.rootEntity, target, updatedProperty, 0);

  return story;
}

function updateEntityPropertyByName(entity, target, updatedProperty, recursion) {

  if (recursion >= constants.MAX_RECURSION) {
    console.log(errors.MAX_RECURSION);
    return entity;
  }

  // current entity matches.
  if (entity.name == target.entity && entity.path == target.path) {
    entity.properties[target.property] = updatedProperty;

  // search children.
  } else {
    for (let propertyName of Object.keys(entity.properties)) {
      let property = entity.properties[propertyName];
      let currentPropertyValue = property.values[property.currentValue];
      for (let childEntityIndex in currentPropertyValue.childEntities) {
        let childEntity = currentPropertyValue.childEntities[childEntityIndex];
        
        let updatedChildEntity = updateEntityPropertyByName(childEntity,
          target, updatedProperty, recursion + 1);
        
        currentPropertyValue.childEntities[childEntityIndex] = updatedChildEntity;
      }
      entity.properties[propertyName].values[property.currentValue] = currentPropertyValue;
    }
  }

  return entity;
}