"use strict";

module.exports = {
  parse: parseActions
};

async function parseActions(rawActions, story) {

  for (let rawActionId in rawActions) {
    let rawAction = rawActions[rawActionId];
    let action = story.newAction(rawAction.name, rawAction.path);
    action.action = rawAction.action.contents;
    story.addAction(action);
  }

  return story;
}
