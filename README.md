# Adventure

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

Games in Adventure are called stories. The `documentation` directory contains
information on how to write these. The `examples` directory contains stories
written for the game, that you can peruse to see how they're put together.