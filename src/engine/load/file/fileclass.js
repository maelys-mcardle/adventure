'use strict';

const path = require('path');

class File {
  constructor(filePath, fileContents) {
    let parsedPath = path.parse(filePath);
    this.directory = parsedPath.dir.split(path.sep);
    this.name = parsedPath.name;
    this.extension = this.stringToFileExtension(parsedPath.ext);
    this.contents = fileContents;
  }

  isYaml() {
    return this.extension === FileExtension.YAML;
  }

  isDot() {
    return this.extension === FileExtension.DOT;
  }

  isMarkdown() {
    return this.extension === FileExtension.MARKDOWN;
  }

  stringToFileExtension(extension) {
    switch(extension.toLowerCase()) {
      case '.yaml':
        return FileExtension.YAML;
      case '.yml':
        return FileExtension.YAML;
      case '.dot':
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