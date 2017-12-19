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
  DIRECTORY_ROOT: '',
  
  // Root config file name.
  FILE_NAME_STORY: 'story',

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
  KEY_SYNONYMS: 'synonyms',
  KEY_TEMPLATES: 'templates',
  KEY_TEXT: 'text',
  KEY_TITLE: 'title',
  KEY_TRANSITION: 'transition',
  KEY_VALUE: 'value',

  // File types.
  TYPE_DOT: 'dot',
  TYPE_MARKDOWN: 'markdown',
  TYPE_YAML: 'yaml',

  // Markdown parser strings.
  MD_MARKDOWN: 'markdown',
  MD_HEADER: 'header',
  MD_PARAGRAPH: 'para',

  // Separator for paths.
  PATH_SEP: '.'
}
