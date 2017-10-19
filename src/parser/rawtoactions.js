"use strict";

module.exports = {
  parse: parseActions
};

async function parseActions(rawStoryActions) {

  let actions = [];
  let action = new Action();

  return actions;
}

class Action {
  constructor() {
    this.name;
    this.path;
    this.action = {};
  }
}
