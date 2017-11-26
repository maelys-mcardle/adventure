# Adventure

Adventure is a game engine reminiscent of 1980's interactive fiction.

The language to create games with this engine is declarative and attempts
to be as straight-forward as possible, as to reduce learning curves. 

## Installing adventure

Make sure you have NodeJS installed. Then run:

`npm install -g https://github.com/maelys-mcardle/adventure`

## Launching a game

An interactive console for the engine be started with the command:

`adventure`

The game will present an empty prompt. You can load a new story 
with the `start` command:

`> start samples/simple`

Use the `help` command to get a listing of all possible commands.

## Developing adventure

To start adventure while developing:

`npm run adventure`