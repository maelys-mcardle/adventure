"use strict";

const walk = require('walk');
const fs = require('fs');
const path = require('path');

module.exports = {
  load: loadFiles
};

async function loadFiles(rootDirectory) {
  let filePaths = await getFilePaths(rootDirectory);
  let files = await getFileContents(rootDirectory, filePaths);
  return files;
}

async function getFilePaths(rootDirectory) {

  let filePaths = [];
  
  let walker = walk.walkSync(rootDirectory, {
    listeners: {
      file: function(fileDirectory, fileStats, next) {
        filePaths.push(path.join(fileDirectory, fileStats.name));
        next(); 
      },
      errors: function(fileDirectory, nodeStats, next) {
        console.log('Error listing file in %s', fileDirectory);
        next(); 
      }
    }
  });

  return filePaths;
}

async function getFileContents(rootDirectory, filePaths) {

  let files = {};

  filePaths.forEach(function(filePath) {
    let fileContents = fs.readFileSync(filePath, {'encoding': 'utf-8'});
    let relativePath = path.relative(rootDirectory, filePath);
    files[relativePath] = fileContents;
  });

  return files;
}
