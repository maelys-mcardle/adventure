'use strict';

const walk = require('walk');
const fs = require('fs');
const path = require('path');
const {File} = require('./fileclass');
const errors = require('../../errors');
const log = require('../../log');

module.exports = {
  load: loadFiles
};

/**
 * Returns all the files in a given directory.
 * @param {sring} rootDirectory The directory path.
 * @returns {File[]} All the files in the directory.
 */
function loadFiles(rootDirectory) {
  let filePaths = getFilePaths(rootDirectory);
  let files = getFileContents(rootDirectory, filePaths);
  return files;
}

/**
 * Returns all the paths for files in a given directory.
 * @param {sring} rootDirectory The directory path.
 * @returns {string[]} All the paths for the files in the directory.
 */
function getFilePaths(rootDirectory) {

  let filePaths = [];
  
  let walker = walk.walkSync(rootDirectory, {
    listeners: {
      file: function(fileDirectory, fileStats, next) {
        filePaths.push(path.join(fileDirectory, fileStats.name));
        next(); 
      },
      errors: function(fileDirectory, nodeStats, next) {
        log.warn(errors.LISTING_FILE(fileDirectory));
        next(); 
      }
    }
  });

  return filePaths;
}

/**
 * Returns all the files with their contents in a given directory.
 * @param {sring} rootDirectory The directory path.
 * @param {sring[]} filePaths All the paths for files in the directory.
 * @returns {File[]} All the files in the directory.
 */
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
