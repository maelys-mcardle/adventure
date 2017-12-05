'use strict';

class RawEntity {
  constructor() {
    this.name;
    this.path;
    this.properties = [];
    this.text = [];
    this.config = [];
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