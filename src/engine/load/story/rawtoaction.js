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

    if (constants.CONFIG_DESCRIPTION in config) {
      action.description = config[constants.CONFIG_DESCRIPTION];
    }

    if (constants.CONFIG_TEMPLATES in config) {
      for (let template of config[constants.CONFIG_TEMPLATES]) {
        action.addTemplate(template);
      }
    }

    if (constants.CONFIG_DEFAULT in config) {
      if (constants.CONFIG_VALUE in config[constants.CONFIG_DEFAULT]) {
        action.defaultPropertyValue = 
          config[constants.CONFIG_DEFAULT][constants.CONFIG_VALUE];
      }
    }

    if (constants.CONFIG_DO in config) {
      if (constants.CONFIG_TRANSITION == config[constants.CONFIG_DO]) {
        action.changesPropertyValue = true;
      }
      if (constants.CONFIG_DESCRIBE == config[constants.CONFIG_DO]) {
        action.describesEntityProperty = true;
      }
    }

    // Synonyms are alternative words that can be used in the
    // templates. So like 'say' can have the synonym 'speak',
    // 'talk'. Explicitly list all templates including these
    // synonyms.
    if (constants.CONFIG_SYNONYM in config) {
      let synonymTemplates = [];
      for (let word of Object.keys(config[constants.CONFIG_SYNONYM])) {
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
