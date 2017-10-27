"use strict";

const loadStory = require('../compiler/loadstory/loadstory');

loadStory.loadJson('samples/simple').then(story => {
  console.log(story);
}).catch(errorReason => console.log(errorReason));