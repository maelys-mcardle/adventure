"use strict";

const loadFiles = require('./loadfiles');

async function parseFiles(storyDirectory) {
    let storyFiles = await loadFiles.load(storyDirectory);

    return storyFiles;
}

async function loadSetup(setupFile) {
    
}

async function loadActions(actionFiles) {

}

async function loadEntities(entityFiles) {

}

parseFiles('samples/simple').then(files => {
    console.log(files)
  }).catch(reason => console.log(reason))