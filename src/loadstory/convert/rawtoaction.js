"use strict";

module.exports = {
  parse: parseActions
};

async function parseActions(rawActions) {

  let actions = [];
  for (let rawActionId in rawActions) {
    let rawAction = rawActions[rawActionId];
    let action = new Action();
    action.name = rawAction.name;
    action.path = rawAction.path;
    action.action = rawAction.action.contents;

    actions.push(action);
  }

  return actions;
}

class Action {
  constructor() {
    this.name;
    this.path;
    this.action = {};
  }
}
