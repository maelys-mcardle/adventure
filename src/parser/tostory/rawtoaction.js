"use strict";

module.exports = {
  parse: parseActions
};

async function parseActions(rawActions, story) {

  for (let rawActionId in rawActions) {
    let rawAction = rawActions[rawActionId];
    let action = story.newAction(rawAction.name, rawAction.path); 
    let config = rawAction.action.contents;

    if ('templates' in config) {
      for (let template of config.templates) {
        action.addTemplate(template);
      }
    }

    if ('default' in config) {
      if ('state' in config.default) {
        action.defaultStateValue = config.default.state;
      }
    }

    if ('synonyms' in config) {
      for (let word of Object.keys(config.synonyms)) {
        for (let synonym of config.synonyms[word]) {
          action.addSynonym(word, synonym);
        }
      }
    }

    if ('help' in config) {
      action.help = config.help;
    }

    story.addAction(action);
  }

  return story;
}
