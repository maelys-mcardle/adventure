'use strict';

const constants = require('../../constants');

class RawEntity {
  constructor() {
    this.name;
    this.path;
    this[constants.TYPE_DOT] = [];
    this[constants.TYPE_MARKDOWN] = [];
    this[constants.TYPE_YAML] = [];
  }
}

class RawAction {
  constructor() {
    this.name;
    this.path;
    this.action;
  }
}

class RawStory {
  constructor(config, actions, entities) {
    this.name;
    this.path;
    this.config = config;
    this.actions = actions;
    this.entities = entities;
  }
}

class RawParsedFile {
  constructor(name, contents) {
    this.name = name;
    this.contents = contents;
  }
}

exports.RawEntity = RawEntity;
exports.RawAction = RawAction;
exports.RawStory = RawStory;
exports.RawParsedFile = RawParsedFile;