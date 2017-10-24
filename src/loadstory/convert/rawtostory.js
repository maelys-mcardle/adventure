"use strict";

const fileToRaw = require('./filetoraw');
const rawToEntity = require('./rawtoentity');
const rawToAction = require('./rawtoaction');

module.exports = {
  parse: rawToStory
};


async function rawToStory(rawStory) {
  let story = new Story();
  story.config = rawStory.config;
  story.actions = await rawToAction.parse(rawStory.actions);
  story.entities = await rawToEntity.parse(rawStory.entities, story.actions);

  return story;
}

class Story {
  constructor() {
    this.name;
    this.config = {};
    this.entities = [];
    this.actions = [];
  }
}