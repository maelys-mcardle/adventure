'use strict';

const path = require('path');

/** Class to store files in memory. */
class File {

  /**
   * Create a File.
   * @param {string} filePath The path of the file.
   * @param {string} fileContents The contents of the file.
   */
  constructor(filePath, fileContents) {
    let parsedPath = path.parse(filePath);
    this.directory = parsedPath.dir.split(path.sep);
    this.name = parsedPath.name;
    this.extension = this.stringToFileExtension(parsedPath.ext);
    this.contents = fileContents;
  }

  /**
   * Returns whether this is a Yaml file.
   * @returns {bool} Whether the file is a Yaml file or not.
   */
  isYaml() {
    return this.extension === FileExtension.YAML;
  }

  /**
   * Returns whether this is a Dot file.
   * @returns {bool} Whether the file is a Dot file or not.
   */
  isDot() {
    return this.extension === FileExtension.DOT;
  }

  /**
   * Returns whether this is a Markdown file.
   * @returns {bool} Whether the file is a Markdown file or not.
   */
  isMarkdown() {
    return this.extension === FileExtension.MARKDOWN;
  }

  /**
   * Returns the FileExtension representation of a file extension.
   * @param {string} extension The file extension as a string.
   * @returns {Symbol} The file extension as a FileExtension symbol.
   */
  stringToFileExtension(extension) {
    switch(extension.toLowerCase()) {
      case '.yaml':
        return FileExtension.YAML;
      case '.yml':
        return FileExtension.YAML;
      case '.dot':
        return FileExtension.DOT;
      case '.gv':
        return FileExtension.DOT;
      case '.md':
        return FileExtension.MARKDOWN;
      default:
        return FileExtension.UNKNOWN;
    }
  }
}

const FileExtension = {
  YAML: Symbol('YAML'),
  DOT: Symbol('DOT'),
  MARKDOWN: Symbol('MARKDOWN'),
  UNKNOWN: Symbol('UNKNOWN'),
}

exports.File = File;