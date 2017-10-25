"use strict";

const fileToRaw = require('./filetoraw');
const rawToEntity = require('./rawtoentity');
const rawToAction = require('./rawtoaction');
const Story = require('./storyclass');

module.exports = {
  parse: rawToStory
};


async function rawToStory(rawStory) {
  let story = new Story();
  story.config = rawStory.config;
  story = await rawToAction.parse(rawStory.actions, story);
  story = await rawToEntity.parse(rawStory.entities, story);

  return story;
}
