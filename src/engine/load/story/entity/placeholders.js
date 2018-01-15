'use strict';

const path = require('path');
const constants = require('../../../constants');
const errors = require('../../../errors');
const log = require('../../../log');

module.exports = {
  replacePlaceholders: replacePlaceholders,
};

/**
 * Replaces all entity placeholders with actual entities.
 * @param {Story} story The story object with placeholders.
 * @param {Entity[]} entities All the entities objects.
 * @returns {Story} The story object with placeholders replaced.
 */
function replacePlaceholders(story, entities) {

  // All entities loaded. Replace placeholders.
  entities = replacePlaceholdersInEntities(entities);

  // Load the root entity. Itself is a placeholder at this point.
  if (story.rootEntity != null) {

    let placeholder = story.rootEntity;
    story.rootEntity = getEntityWithPath(entities, placeholder);

  } else {

    log.warn(errors.NO_ENTITIES_IN_STORY);

  }

  return story;
}

/**
 * Replaces all entity placeholders with actual entities.
 * @param {Entity[]} entities All the entities objects.
 * @returns {Entity[]} All the entities objects with placeholders replaced.
 */
function replacePlaceholdersInEntities(entities) {

  // Iterate over every entity.
  for (let entityIndex in entities) {
    let entity = entities[entityIndex];
    entity = replacePlaceholdersInChildEntities(entities, entity, 0);
    entities[entityIndex] = entity;
  }

  return entities;
}

/**
 * Replaces all entity placeholders with actual entities.
 * @param {Entity[]} entities All the entities objects.
 * @param {Entity} entity The entity whose placeholders are being updated.
 * @param {number} recursion Prevents infinite loops.
 * @returns {Entity} The entity with placeholders replaced.
 */
function replacePlaceholdersInChildEntities(entities, entity, recursion) {
  
  if (recursion >= constants.MAX_RECURSION) {
    log.warn(errors.MAX_RECURSION);
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

          let childEntity = getEntityWithPath(entities, placeholder);

          // Create a copy as it will be modified.
          childEntity = copyObject(childEntity);

          // child path is:
          //  parentPath.parentName.parentProperty.parentPropertyValue.childPath
          let childPath = 
            [entity.path, entity.name, propertyName, propertyValueName, 
              childEntity.path].filter(s => s != '').join(constants.PATH_SEP);

          childEntity.path = childPath;
          childEntity = replacePlaceholdersInChildEntities(
            entities, childEntity, recursion + 1);
          
          propertyValue.childEntities[childIndex] = childEntity;
        }
      }
      property.values[propertyValueName] = propertyValue;
    }
    entity.properties[propertyName] = property;
  }
  
  return entity;
}

/**
 * Returns an entity that has the specified path.
 * @param {Entity[]} entities All the entities objects.
 * @param {string} path The path the desired entity has.
 * @returns {Entity} The matching entity.
 */
function getEntityWithPath(entities, path) {
  let splitPath = path.split(constants.PATH_SEP);

  if (splitPath.length > 0 ) {
   
    let searchName = splitPath.pop();
    let searchPath = splitPath.join(constants.PATH_SEP);

    for (let entity of entities) {
      if (searchName == entity.name &&
          searchPath == entity.path) {
        return entity;
      }
    }
  }

  log.warn(errors.CHILD_ENTITY_NOT_FOUND(path));
  return path;
}

/**
 * Copies an object.
 * @param {Object} object The object to copy.
 * @returns {Object} A copy of the object.
 */
function copyObject(object) {
  return JSON.parse(JSON.stringify(object));
}
