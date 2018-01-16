# Adventure

<!-- TOC -->

- [Adventure](#adventure)
  - [Overview](#overview)
  - [Installing adventure](#installing-adventure)
  - [Playing a game](#playing-a-game)
  - [Learning how to create games](#learning-how-to-create-games)
  - [Developing with Adventure](#developing-with-adventure)

<!-- /TOC -->

## Overview

Adventure is a game engine for [text adventures](https://en.wikipedia.org/wiki/Interactive_fiction). 

It lets you create interactive fiction without needing to learn how to program.
Games are written in a declarative language instead which is used to define the 
game world and the actions within it.

## Installing adventure

Make sure you have [NodeJS](https://nodejs.org/) installed. Then run:

```
npm install -g https://github.com/maelys-mcardle/adventure
```

## Playing a game

An interactive console for the engine be started with the command:

```bash
adventure
```

The game will present an empty prompt. You can load a new story 
with the `load` command:

```
> load path/to/story
```

Use the `help` command to get a listing of all possible commands.

## Learning how to create games

Games in Adventure are called stories. The [documentation](documentation) 
directory contains information on how to write these. The [examples](examples) 
directory contains stories written for the game, that you can peruse to see 
how they're put together.

## Developing with Adventure

You can also integrate adventure in your own software using its API.

Add Adventure as a dependency in your `package.json` file:

```json
{
  "name": "your-package",
  "version": "1.0.0",
  "dependencies": {
    "adventure": "maelys-mcardle/adventure"
  }
}
```

Then you can use the game engine in your code:

```js
'use strict';

// Import the Adventure API.
const adventure = require('adventure');

// Loads a story from a directory. Here it loads a sample.
let story = adventure.loadStory('node_modules/adventure/examples/thehouse');

// Get the output from the story in its initial state.
let text = adventure.getStoryOutput(story);
console.log(text);

/* Prints out:
[ 'You are in the bedroom. It hasn\'t changed since your childhood.
   Your pink bed sheets. The blue walls. Your plush animals. Your polly pocket 
   and transformers lining the shelves. Traces of your teenage self - the boxes
   of video games you kept perfectly. The computer you built, and rebuilt. An 
   entire life that suddenly stops midway through university.',
  'A letter is on the bedside table.' ]
*/

// Gets examples of eligible player input to move the story forward.
let inputExamples = adventure.getInputExamples(story);
console.log(inputExamples);

/* Prints out:
[ 'go to the upstairs hallway',
  'read the letter',
  'describe world' ]
*/

// Execute a player input, which will move the story forward.
[story, text] = adventure.evaluateInput(story, 'walk to upstairs hallway');
console.log(text);

/* Prints out:
[ 'You are in the upstairs hallway. Paintings line the wall.' ]
*/
```