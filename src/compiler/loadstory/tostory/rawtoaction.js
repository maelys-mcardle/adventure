"use strict";

module.exports = {
  parse: parseActions
};

function parseActions(rawActions, story) {

  for (let rawActionId in rawActions) {
    let rawAction = rawActions[rawActionId];
    let config = rawAction.action.contents;
    let action = story.newAction(rawAction.name, rawAction.path); 

    if ('description' in config) {
      action.description = config.description;
    }

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

    if ('do' in config) {
      if ('transition' == config.do) {
        action.doStateChange = true;
      }
      if ('describe' == config.do) {
        action.doDescribeEntity = true;
      }
    }

    // Synonyms are alternative words that can be used in the
    // templates. So like "say" can have the synonym "speak",
    // "talk". Explicitly list all templates including these
    // synonyms.
    if ('synonyms' in config) {
      let synonymTemplates = [];
      for (let word of Object.keys(config.synonyms)) {
        for (let synonym of config.synonyms[word]) {
          for (let template of action.templates) {
            if (template.includes(word)) {
              synonymTemplates.push(
                template.replace(word, synonym)
              )
            } else {
              console.log("Word " + word + " not found in template " +
                         template);
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
