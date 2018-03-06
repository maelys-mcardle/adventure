'use strict';

module.exports = {

  // Versioning used for the story files.
  // The story files are the stories written by authors.
  STORY_FILES_VERSION: 1,

  // Versioning used for the story object.
  // The story object is the internal representation.
  STORY_OBJECT_VERSION: 1,

  // Maximum recursion allowed for recursive functions.
  // To prevent bugs from killing the program.
  MAX_RECURSION: 5,

  // How close input has to be to a known accepted phrase
  // to be considered a match or a possible suggestion.
  // 0.9 == 90% of input has to match a known phrase
  RATING_MATCH: 0.9,
  RATING_SUGGESTION: 0.5,

  // Directories.
  DIRECTORY_ACTIONS: 'actions',
  DIRECTORY_ENTITIES: 'entities',
  DIRECTORY_ROOT: '',
  
  // Root config file name.
  FILE_NAME_STORY: 'story',

  // Keys.
  KEY_ACTION: 'action',
  KEY_ACTIONS: 'actions',
  KEY_AUTHOR: 'author',
  KEY_CHANGE: 'change',
  KEY_DEFAULT: 'default',
  KEY_DESCRIBE: 'describe',
  KEY_DESCRIPTION: 'description',
  KEY_DISABLE: 'disable',
  KEY_ENABLE: 'enable',
  KEY_ENTITIES: 'entities',
  KEY_ENTITY: 'entity',
  KEY_ENTITY_PLACEHOLDER: '@entity',
  KEY_IS: 'is',
  KEY_MESSAGE: 'message',
  KEY_NONE: '.none',
  KEY_PROPERTY_PLACEHOLDER: '@property',
  KEY_REVERT: '.revert',
  KEY_RULES: 'rules',
  KEY_SYNONYMS: 'synonyms',
  KEY_TEMPLATES: 'templates',
  KEY_TEXT: 'text',
  KEY_TITLE: 'title',
  KEY_VALUE: 'value',
  KEY_VALUE_PLACEHOLDER: '@value',
  KEY_VERSION: 'version',
  KEY_WHEN: 'when',

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
