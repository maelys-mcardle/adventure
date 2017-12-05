'use strict';

const walk = require('walk');
const fs = require('fs');
const path = require('path');
const {File} = require('./fileclass');
const errors = require('../../errors');

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
        console.log(errors.LISTING_FILE(fileDirectory));
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
