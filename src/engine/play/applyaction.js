'use strict';

const executeRules = require('./rules/executerules');
const getProperty = require('./entities/getproperty');
const getText = require('./text/gettext');

module.exports = {
  apply: applyAction,
}

/**
 * Applies an action to a specified target.
 * @param {Story} story The story object.
 * @param {string} actionName The action performed.
 * @param {Target} target The entity and property to perform the action on.
 * @param {string} value The value to change the property to.
 * @returns {[Story, string[]]} The updated story and text output.
 */
function applyAction(story, actionName, target, value) {

  let action = story.actions[actionName];
  let text = [];

  if (action.changesPropertyValue) { 
    [story, text] = changeValue(story, action, target, value);
  } else if (action.describesPropertyValue) {
    text = describeValue(story, target);
  }

  return [story, text];
}

/**
 * Gets all the text for the property's current value.
 * @param {Story} story The story object.
 * @param {Target} target The entity and property to get the text of.
 * @returns {string[]} The paragraphs of text.
 */
function describeValue(story, target) {

  let paragraphs = [];

  // Get entity property.
  let property = 
    getProperty.getProperty(story, target);

  if (property == null) {
    return paragraphs;
  }

  // Print the description.
  paragraphs = getText.getProperty(property);
  return paragraphs;
}

/**
 * Changes the value of the target using the action.
 * @param {Story} story The story object.
 * @param {string} actionName The action performed.
 * @param {Target} target The entity and property to perform the action on.
 * @param {string} value The value to change the property to.
 * @returns {[Story, string[]]} The updated story and text output.
 */
function changeValue(initialStory, action, target, value) {

  let transitionMessages = [];
  let newValueMessages = [];
  
  // Copy story. This is so changes to the initialStory is preserved,
  // and doesn't get modified.
  let updatedStory = createCopy(initialStory);

  // Transition to new value:
  //  - set new value
  //  - apply rules for transition
  [updatedStory, transitionMessages] = 
    executeRules.executeTransition(updatedStory, action, target, value);

  // Print the current delta.
  let paragraphs = getText.getDelta(initialStory, updatedStory);

  // Apply rules for when in new value.
  [updatedStory, newValueMessages] = executeRules.executeCurrent(updatedStory);

  // Concatenate the output.
  let output = 
    transitionMessages.
      concat(paragraphs).
      concat(newValueMessages);
  
  return [updatedStory, output];
}

/**
 * Deep-copies a Javascript object.
 * @param {Object} object The object to copy.
 * @returns {Object} The copy of the object.
 */
function createCopy(object) {
  return JSON.parse(JSON.stringify(object));
}
