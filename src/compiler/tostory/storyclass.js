"use strict";

class Story {
  constructor(name) {
    this.title = 'Untitled';
    this.author = 'Anonymous';
    this.currentState = [];
    this.actions = [];
  }

  newEntity(name, path) {
    return new Entity(name, path);
  }
  
  addCurrentState(entity) {
    this.currentState.push(entity);
  }

  newAction(name, path) {
    return new Action(name, path);
  }

  addAction(action) {
    this.actions.push(action);
  }
}

class Entity {
  constructor(name, path) {
    this.name = name;
    this.path = path;
    this.states = {};
  }

  newState(name) {
    return new EntityState(name);
  }

  addState(state) {
    this.states[state.name] = state;
  }
}

class EntityState {
  constructor(name) {
    this.name = name;
    this.messages = {};
    this.values = {};
    this.actions = [];
    this.defaultValue;
    this.currentValue;
  }

  newValue(name) {
    return new EntityStateValue(name);
  }

  addValue(value) {
    this.values[value.name] = value;
  }
}

class EntityStateValue {
  constructor(name) {
    this.name = name;
    this.text = '';
    this.disabled = false;
    this.relationships = {};
    this.childEntities = [];
    this.rules = [];
  }

  newRelationship(toState) {
    return new EntityStateRelationship(toState);
  }

  addRelationship(relationship) {
    this.relationships[relationship.toState] = relationship;
  }
}

class EntityStateRelationship {
  constructor(toState) {
    this.toState = toState;
    this.text = '';
    this.rules = [];
  }
}

class Action {
  constructor(name, path) {
    this.name = name;
    this.path = path;
    this.templates = [];
    this.synonyms = {};
    this.defaultStateValue;
    this.help = 'No help available for this action.';
  }

  addTemplate(template) {
    this.templates.push(template);
  }

  addSynonym(word, synonym) {
    if (!(word in this.synonyms)) {
      this.synonyms[word] = [synonym];
    } else { 
      this.synonyms[word].push(synonym);
    }
  }
}

module.exports = Story;