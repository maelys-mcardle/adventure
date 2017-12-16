'use strict';

const rawToConfig = require('./rawtoconfig');
const rawToEntity = require('./rawtoentity');
const rawToAction = require('./rawtoaction');
const Story = require('./storyclass');

module.exports = {
  parse: rawToStory
};

/**
 * Parses the story in the intermediary format and creates the story object.
 * @param {RawStory} rawStory The story in the intermediary format.
 * @returns {Story} The story object.
 */
function rawToStory(rawStory) {
  let story = new Story();
  story = rawToConfig.parse(rawStory.config, story);
  story = rawToAction.parse(rawStory.actions, story);
  story = rawToEntity.parse(rawStory.entities, story);

  return story;
}
