'use strict';

module.exports = {
  parse: parseActions
};

const constants = require('../../constants');
const errors = require('../../errors');

function parseActions(rawActions, story) {

  for (let rawActionId in rawActions) {
    let rawAction = rawActions[rawActionId];
    let config = rawAction.action.contents;
    let action = story.newAction(rawAction.name, rawAction.path); 

    if (constants.KEY_DESCRIPTION in config) {
      action.description = config[constants.KEY_DESCRIPTION];
    }

    if (constants.KEY_TEMPLATES in config) {
      for (let template of config[constants.KEY_TEMPLATES]) {
        action.addTemplate(template);
      }
    }

    if (constants.KEY_DEFAULT in config) {
      if (constants.KEY_VALUE in config[constants.KEY_DEFAULT]) {
        action.defaultPropertyValue = 
          config[constants.KEY_DEFAULT][constants.KEY_VALUE];
      }
    }

    if (constants.KEY_DO in config) {
      if (constants.KEY_TRANSITION == config[constants.KEY_DO]) {
        action.changesPropertyValue = true;
      }
      if (constants.KEY_DESCRIBE == config[constants.KEY_DO]) {
        action.describesEntityProperty = true;
      }
    }

    // Synonyms are alternative words that can be used in the
    // templates. So like 'say' can have the synonym 'speak',
    // 'talk'. Explicitly list all templates including these
    // synonyms.
    if (constants.KEY_SYNONYM in config) {
      let synonymTemplates = [];
      for (let word of Object.keys(config[constants.KEY_SYNONYM])) {
        for (let synonym of config.synonyms[word]) {
          for (let template of action.templates) {
            if (template.includes(word)) {
              synonymTemplates.push(
                template.replace(word, synonym)
              )
            } else {
              console.log(errors.WORD_NOT_IN_TEMPLATE(word, template));
            }
          }
        }
      }
      action.templates = action.templates.concat(synonymTemplates);
    }

    story.addAction(action);
  }

  return story;
}
