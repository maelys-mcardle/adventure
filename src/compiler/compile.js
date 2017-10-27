"use strict";

const loadStory = require('./loadstory');

loadStory.loadJson('samples/simple').then(story => {
  console.log(story)
}).catch(reason => console.log(reason))