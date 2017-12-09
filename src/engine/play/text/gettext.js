'use strict';

const constants = require('../../constants');
const errors = require('../../errors');

module.exports = {
  getAll: getStoryText,
  getDelta: getStoryDeltaText,
  getEntity: getEntityText,
  getProperty: getPropertyText,
}

/**
 * Gets the text for the story in its current state.
 * @param {Story} story The story object.
 * @returns {string[]} The paragraphs of text.
 */
function getStoryText(story) {

  if (story.rootEntity == null) {
    console.log(errors.ROOT_ENTITY_UNDEFINED);
    return '';
  }

  let text = getEntityText(story.rootEntity, 0);
  return text;
}

/**
 * Gets only the text that changed for the story.
 * @param {Story} oldStory The story object.
 * @param {Story} newStory The story object.
 * @returns {string[]} The paragraphs of text.
 */
function getStoryDeltaText(oldStory, newStory) {

  let oldEntity = oldStory.rootEntity;
  let newEntity = newStory.rootEntity;
  let text = getEntityDeltaText(oldEntity, newEntity, 0);
  
  return text;
}

/**
 * Gets only the text that changed for the entity.
 * @param {Entity} oldEntity The entity object.
 * @param {Entity} newEntity The entity object.
 * @param {number} recursion Tracks recursive invocations of function.
 * @returns {string[]} The paragraphs of text.
 */
function getEntityDeltaText(oldEntity, newEntity, recursion) {
  let text = [];
  
  if (recursion >= constants.MAX_RECURSION) {
    console.log(errors.MAX_RECURSION);
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

/**
 * Gets only the text for the transition from one value to another.
 * @param {Property} property The property object.
 * @param {string} fromValue The entity object.
 * @param {string} toValue The entity object.
 * @returns {string[]} The paragraphs of text.
 */
function getTransitionText(property, fromValue, toValue) {
  return property.values[fromValue].relationships[toValue].text;
}

/**
 * Gets all the text for the entity in its current state.
 * @param {Entity} entity The entity object.
 * @returns {string[]} The paragraphs of text.
 */
function getEntityText(entity) {
  return getEntityTextRecursive(entity, 0);
}

/**
 * Gets all the text for the property in its current state.
 * @param {Property} property The property object.
 * @returns {string[]} The paragraphs of text.
 */
function getPropertyText(property) {
  return getPropertyTextRecursive(property, 0);
}

/**
 * Gets all the text for the entity in its current state.
 * @param {Entity} entity The entity object.
 * @param {number} recursion Tracks recursive invocations of function.
 * @returns {string[]} The paragraphs of text.
 */
function getEntityTextRecursive(entity, recursion) {
  let text = [];

  if (recursion >= constants.MAX_RECURSION) {
    console.log(errors.MAX_RECURSION);
    return text;
  }

  for (let propertyName of Object.keys(entity.properties)) {
    let property = entity.properties[propertyName];
    let propertyText = getPropertyTextRecursive(property, recursion);
    text = text.concat(propertyText);
  }

  return text;
}

/**
 * Gets all the text for the property in its current state.
 * @param {Property} property The property object.
 * @param {number} recursion Tracks recursive invocations of function.
 * @returns {string[]} The paragraphs of text.
 */
function getPropertyTextRecursive(property, recursion) {

  let value = property.currentValue;
  let propertyValueText = property.values[value].text;
  let text = propertyValueText;

  for (let childEntity of property.values[value].childEntities) {
    let childEntityText = getEntityTextRecursive(childEntity, recursion + 1);
    text = text.concat(childEntityText);
  }

  return text;
}
