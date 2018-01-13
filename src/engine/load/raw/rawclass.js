'use strict';

const constants = require('../../constants');

/** The intermediate representation of an entity. */
class RawEntity {
  constructor() {
    this.name;
    this.path;
    this[constants.TYPE_DOT] = [];
    this[constants.TYPE_MARKDOWN] = [];
    this[constants.TYPE_YAML] = [];
  }
}

/** The intermediate representation of an action. */
class RawAction {
  constructor() {
    this.name;
    this.path;
    this.action;
  }
}

/** The intermediate representation of a story object. */
class RawStory {
  constructor(foundStory, config, actions, entities) {
    
    this.foundStory = foundStory;
    this.config = config;
    this.actions = actions;
    this.entities = entities;

    if (constants.KEY_VERSION in config && 
        Number.isInteger(config[constants.KEY_VERSION])) {
    
      // Version specified and an integer. Load it in.
      this.version = config[constants.KEY_VERSION];
    } else {
      // Version not specified or not an integer. Assume latest.
      this.version = constants.STORY_FILES_VERSION;
    }
  }
}

/** Contains a file's name and contents. */
class RawFile {
  constructor(name, contents) {
    this.name = name;
    this.contents = contents;
  }
}

exports.RawEntity = RawEntity;
exports.RawAction = RawAction;
exports.RawStory = RawStory;
exports.RawFile = RawFile;