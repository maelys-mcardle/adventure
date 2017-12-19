'use strict';

const constants = require('../../constants');

class Story {
  constructor(name) {
    this.title = 'Untitled';
    this.author = 'Anonymous';
    this.description = '';
    this.rootEntity = null;
    this.actions = {};
    this.version = constants.STORY_OBJECT_VERSION;
  }

  newEntity(name, path) {
    return new Entity(name, path);
  }
  
  newAction(name, path) {
    return new Action(name, path);
  }

  addAction(action) {
    let key = 
      action.path === '' ? 
        action.name: 
        action.path + constants.PATH_SEP + action.name;
    this.actions[key] = action;
  }
}

class Entity {
  constructor(name, path) {
    this.name = name;
    this.path = path;
    this.properties = {};
  }

  newProperty(name) {
    return new Property(name);
  }

  addProperty(property) {
    this.properties[property.name] = property;
  }
}

class Property {
  constructor(name) {
    this.name = name;
    this.messages = {};
    this.values = {};
    this.actions = [];
    this.currentValue = null;
  }

  newValue(name) {
    return new Value(name);
  }

  addValue(value) {
    this.values[value.name] = value;
  }
}

class Value {
  constructor(name) {
    this.name = name;
    this.readableName = name;
    this.text = [];
    this.disabled = false;
    this.relationships = {};
    this.childEntities = [];
    this.rules = {};
  }

  newRelationship(toValue) {
    return new Relationship(toValue);
  }

  addRelationship(relationship) {
    this.relationships[relationship.toValue] = relationship;
  }
}

class Relationship {
  constructor(toValue) {
    this.toValue = toValue;
    this.text = [];
    this.rules = [];
  }
}

class Action {
  constructor(name, path) {
    this.name = name;
    this.path = path;
    this.templates = [];
    this.defaultPropertyValue = null;
    this.changesPropertyValue = false;
    this.describesEntityProperty = false;
  }

  addTemplate(template) {
    this.templates.push(template);
  }
}

module.exports = Story;