'use strict';

const constants = require('../../constants');

/** The internal representation of a story. */
class Story {
  constructor(name) {
    this.title = 'Untitled';
    this.author = 'Anonymous';
    this.description = '';
    this.rootEntity = null;
    this.actions = {};
    this.version = constants.STORY_OBJECT_VERSION;
  }

  /**
   * Instantiates a new entity.
   * @param {string} name The name of the entity.
   * @param {string} path The path of the entity.
   * @returns {Entity} The new entity instance.
   */
  newEntity(name, path) {
    return new Entity(name, path);
  }
  
  /**
   * Instantiates a new action.
   * @param {string} name The name of the action.
   * @param {string} path The path of the action.
   * @returns {Action} The new action instance.
   */
  newAction(name, path) {
    return new Action(name, path);
  }

  /**
   * Loads an action into the story.
   * @param {Action} action The action to load.
   * @returns {undefined}
   */
  addAction(action) {
    let key = 
      action.path === '' ? 
        action.name: 
        action.path + constants.PATH_SEP + action.name;
    this.actions[key] = action;
  }
}

/** Class for the story's entities. */
class Entity {
  constructor(name, path) {
    this.name = name;
    this.path = path;
    this.properties = {};
  }

  /**
   * Instantiates a new property.
   * @param {string} name The name of the property.
   * @returns {Property} The new property instance.
   */
  newProperty(name) {
    return new Property(name);
  }

  /**
   * Loads a property into the entity.
   * @param {Property} property The property to load.
   * @returns {undefined}
   */  
  addProperty(property) {
    this.properties[property.name] = property;
  }
}

/** Class for the story entity's properties. */
class Property {
  constructor(name) {
    this.name = name;
    this.messages = {};
    this.values = {};
    this.actions = [];
    this.currentValue = null;
  }

  /**
   * Instantiates a new value.
   * @param {string} name The name of the value.
   * @returns {Value} The new value instance.
   */
  newValue(name) {
    return new Value(name);
  }

  /**
   * Loads a value into the property.
   * @param {Value} value The value to load.
   * @returns {undefined}
   */  
  addValue(value) {
    this.values[value.name] = value;
  }
}


/** Class for the story entity property's values. */
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

  /**
   * Instantiates a new relationship.
   * @param {string} toValue What value the relationship is formed to.
   * @returns {Relationship} The new relationship instance.
   */
  newRelationship(toValue) {
    return new Relationship(toValue);
  }

  /**
   * Loads a relationship into the value.
   * @param {Relationship} relationship The relationship to load.
   * @returns {undefined}
   */  
  addRelationship(relationship) {
    this.relationships[relationship.toValue] = relationship;
  }
}

/** Class for the story entity property values' relationships. */
class Relationship {
  constructor(toValue) {
    this.toValue = toValue;
    this.text = [];
    this.rules = [];
  }
}

/** Class for the story's actions. */
class Action {
  constructor(name, path) {
    this.name = name;
    this.path = path;
    this.templates = [];
    this.defaultPropertyValue = null;
    this.changesPropertyValue = false;
    this.describesPropertyValue = false;
  }

  /**
   * Loads a template into the action.
   * @param {string} template The template to load.
   * @returns {undefined}
   */  
  addTemplate(template) {
    this.templates.push(template);
  }
}

module.exports = Story;