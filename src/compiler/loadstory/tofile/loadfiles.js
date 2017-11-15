"use strict";

const walk = require('walk');
const fs = require('fs');
const path = require('path');

module.exports = {
  load: loadFiles
};

function loadFiles(rootDirectory) {
  let filePaths = getFilePaths(rootDirectory);
  let files = getFileContents(rootDirectory, filePaths);
  return files;
}

function getFilePaths(rootDirectory) {

  let filePaths = [];
  
  let walker = walk.walkSync(rootDirectory, {
    listeners: {
      file: function(fileDirectory, fileStats, next) {
        filePaths.push(path.join(fileDirectory, fileStats.name));
        next(); 
      },
      errors: function(fileDirectory, nodeStats, next) {
        console.log(`Error listing file in ${fileDirectory}`);
        next(); 
      }
    }
  });

  return filePaths;
}

function getFileContents(rootDirectory, filePaths) {

  let files = [];

  filePaths.forEach(function(filePath) {
    let fileContents = fs.readFileSync(filePath, {'encoding': 'utf-8'});
    let relativePath = path.relative(rootDirectory, filePath);
    let fileObject = new File(relativePath, fileContents);

    files.push(fileObject);
  });

  return files;
}

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
      case ".yaml":
        return FileExtension.YAML;
      case ".yml":
        return FileExtension.YAML;
      case ".dot":
        return FileExtension.DOT;
      case ".md":
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