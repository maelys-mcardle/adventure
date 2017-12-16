'use strict';

const rawToConfig = require('./config/rawtoconfig');
const rawToEntity = require('./entity/rawtoentity');
const rawToAction = require('./action/rawtoaction');
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
