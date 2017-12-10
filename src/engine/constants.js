'use strict';

module.exports = {

  // Versioning used for the story object.
  STORY_OBJECT_VERSION: 1,

  // Maximum recursion allowed for recursive functions.
  // To prevent bugs from killing the program.
  MAX_RECURSION: 5,

  // Directories.
  DIRECTORY_ACTIONS: 'actions',
  DIRECTORY_ENTITIES: 'entities',
  DIRECTORY_CONFIG: '',
  
  // Root config file name.
  FILE_NAME_CONFIG: 'config',

  // Keys.
  KEY_ACTIONS: 'actions',
  KEY_AUTHOR: 'author',
  KEY_DEFAULT: 'default',
  KEY_DESCRIPTION: 'description',
  KEY_DISABLE: 'disable',
  KEY_DO: 'do',
  KEY_ENABLE: 'enable',
  KEY_ENTITIES: 'entities',
  KEY_ENTITY: 'entity',
  KEY_IF: 'if',
  KEY_IS: 'is',
  KEY_LAST: '.last',
  KEY_MESSAGE: 'message',
  KEY_RULES: 'rules',
  KEY_SYNONYM: 'synonym',
  KEY_TEMPLATES: 'templates',
  KEY_TITLE: 'title',
  KEY_TRANSITION: 'transition',
  KEY_VALUE: 'value',

  // Markdown parser strings.
  MD_MARKDOWN: 'markdown',
  MD_HEADER: 'header',
  MD_PARAGRAPH: 'para',
}
