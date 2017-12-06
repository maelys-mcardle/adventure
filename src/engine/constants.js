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
  CONFIG_FILE_NAME: 'config',

  // Config keys.
  CONFIG_ACTIONS: 'actions',
  CONFIG_AUTHOR: 'author',
  CONFIG_DEFAULT: 'default',
  CONFIG_DESCRIBE: 'describe',
  CONFIG_DESCRIPTION: 'description',
  CONFIG_DISABLE: 'disable',
  CONFIG_DO: 'do',
  CONFIG_ENTITIES: 'entities',
  CONFIG_ENTITY: 'entity',
  CONFIG_RULES: 'rules',
  CONFIG_SYNONYM: 'synonym',
  CONFIG_TEMPLATES: 'templates',
  CONFIG_TITLE: 'title',
  CONFIG_TRANSITION: 'transition',
  CONFIG_VALUE: 'value',

  // Markdown parser strings.
  MD_MARKDOWN: 'markdown',
  MD_HEADER: 'header',
  MD_PARAGRAPH: 'para',
}
