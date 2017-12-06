'use strict';

const path = require('path');
const constants = require('../../constants');
const errors = require('../../errors');

module.exports = {
  entityPlaceholderToEntity: entityPlaceholderToEntity,
  loadCurrentPropertyEntities: loadCurrentPropertyEntities
};

function loadCurrentPropertyEntities(story, entities) {

  if (story.rootEntity == null) {
    console.log(errors.NO_ENTITIES_IN_STORY);
  }

  story.rootEntity = getEntityFromPath(entities, story.rootEntity);
  return story;
}

function entityPlaceholderToEntity(entities) {

  // Iterate over every entity.
  for (let entityIndex in entities) {
    let entity = entities[entityIndex];
    entity = updateEntityPlaceholders(entities, entity, 0);
    entities[entityIndex] = entity;
  }

  return entities;
}

function updateEntityPlaceholders(entities, entity, recursion) {
  
  if (recursion >= constants.MAX_RECURSION) {
    console.log(errors.MAX_RECURSION);
    return entity;
  }
      
  // Iterate over every entity's property.
  for (let propertyName of Object.keys(entity.properties)) {
    let property = entity.properties[propertyName];

    // Iterate over every entity's property values.
    for (let propertyValueName of Object.keys(property.values)) {
      let propertyValue = property.values[propertyValueName];

      // Iterate over all child entities in the property values.
      for (let childIndex in propertyValue.childEntities) {
        let placeholder = propertyValue.childEntities[childIndex];
        if (typeof(placeholder) === 'string') {
          let childEntity = getEntityFromPath(entities, placeholder);

          // Create a copy as it will be modified.
          childEntity = copyEntity(childEntity);

          // child path is:
          //  parentPath.parentName.parentProperty.parentPropertyValue.childPath
          let childPath = 
            [entity.path, entity.name, propertyName, propertyValueName, 
              childEntity.path].filter(s => s != '').join('.');

          childEntity.path = childPath;
          childEntity = updateEntityPlaceholders(entities, 
            childEntity, recursion + 1);
          
          propertyValue.childEntities[childIndex] = childEntity;
        }
      }
      property.values[propertyValueName] = propertyValue;
    }
    entity.properties[propertyName] = property;
  }
  
  return entity;
}

function getEntityFromPath(entities, path) {
  let splitPath = path.split('.');

  if (splitPath.length > 0 ) {
   
    let searchName = splitPath.pop();
    let searchPath = splitPath.join('.');

    for (let entity of entities) {
      if (searchName == entity.name &&
          searchPath == entity.path) {
        return entity;
      }
    }
  }

  console.log(errors.CHILD_ENTITY_NOT_FOUND(path));
  return path;
}

function copyEntity(entity) {
  return JSON.parse(JSON.stringify(entity));
}
