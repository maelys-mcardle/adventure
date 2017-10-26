"use strict";

const rawToConfig = require('./rawtoconfig');
const rawToEntity = require('./rawtoentity');
const rawToAction = require('./rawtoaction');
const pathToEntity = require('./pathtoentity');
const Story = require('./storyclass');

module.exports = {
  parse: rawToStory
};

async function rawToStory(rawStory) {
  let story = new Story();
  story = await rawToConfig.parse(rawStory.config, story);
  story = await rawToAction.parse(rawStory.actions, story);
  story = await rawToEntity.parse(rawStory.entities, story);
  story = await pathToEntity.replacePlaceholdersWithEntities(story);

  return story;
}
