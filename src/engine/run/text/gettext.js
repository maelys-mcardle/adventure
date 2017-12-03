'use strict';

module.exports = {
  getAll: getStoryText,
  getDelta: getStoryDeltaText,
  getEntity: getEntityText,
  getEntityProperty: getEntityPropertyText,
}

const constants = require('../../constants');
const strings = require('../../strings');

function getStoryText(story) {

  if (story.rootEntity == null) {
    console.log(strings.ERROR_ROOT_ENTITY_UNDEFINED);
    return '';
  }

  let text = getEntityText(story.rootEntity, 0);
  return text;
}

function getStoryDeltaText(oldStory, newStory) {

  let oldEntity = oldStory.rootEntity;
  let newEntity = newStory.rootEntity;
  let text = getEntityDeltaText(oldEntity, newEntity, 0);
  
  return text;
}

function getEntityDeltaText(oldEntity, newEntity, recursion) {
  let text = [];
  
  if (recursion >= constants.MAX_RECURSION) {
    console.log(strings.ERROR_MAX_RECURSION);
    return text;
  }

  for (let propertyName of Object.keys(oldEntity.properties)) {
    let oldProperty = oldEntity.properties[propertyName];
    let newProperty = newEntity.properties[propertyName]; 
    let oldValue = oldProperty.currentValue;
    let newValue = newProperty.currentValue;

    // Value changed. Describe everything.
    if (oldValue != newValue) {
      
      let propertyTransitionText = 
        getTransitionText(oldProperty, oldValue, newValue);

      let propertyValueText = getEntityText(newEntity);

      text = text.
        concat(propertyTransitionText).
        concat(propertyValueText).
        filter(value => value != '');
    
    // Value same. See if child changed.
    } else {
      for (let childIndex in newProperty.values[newValue].childEntities) {
        let oldChild = oldProperty.values[oldValue].childEntities[childIndex];
        let newChild = newProperty.values[newValue].childEntities[childIndex];
        let childText = getEntityDeltaText(oldChild, newChild, recursion + 1);
        text = text.concat(childText);
      }
    }
  }

  return text;
}

function getTransitionText(property, fromValue, toValue) {
  return property.values[fromValue].relationships[toValue].text;
}

function getEntityText(entity) {
  return getEntityTextRecursive(entity, 0);
}

function getEntityPropertyText(property) {
  return getEntityPropertyTextRecursive(property, 0);
}

function getEntityTextRecursive(entity, recursion) {
  let text = [];

  if (recursion >= constants.MAX_RECURSION) {
    console.log(strings.ERROR_MAX_RECURSION);
    return text;
  }

  for (let propertyName of Object.keys(entity.properties)) {
    let property = entity.properties[propertyName];
    let propertyText = getEntityPropertyTextRecursive(property, recursion);
    text = text.concat(propertyText);
  }

  return text;
}

function getEntityPropertyTextRecursive(property, recursion) {
  let text = [];

  let value = property.currentValue;

  let propertyValueText = property.values[value].text;
  text.push(propertyValueText);

  for (let childEntity of property.values[value].childEntities) {
    let childEntityText = getEntityTextRecursive(childEntity, recursion + 1);
    text = text.concat(childEntityText);
  }

  return text;
}
