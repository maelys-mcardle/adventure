# Adventure

Adventure is a game engine reminiscent of 1980's interactive fiction.

The language to create games with this engine is declarative and attempts
to be as straight-forward as possible, as to reduce learning curves. 

## Installing adventure

Make sure you have [NodeJS](https://nodejs.org/) installed. Then run:

`npm install -g https://github.com/maelys-mcardle/adventure`

## Launching a game

An interactive console for the engine be started with the command:

`adventure`

The game will present an empty prompt. You can load a new story 
with the `start` command:

`> start path/to/story`

Use the `help` command to get a listing of all possible commands.

## Developing for adventure

Make sure you have `git`, `npm` and `nodejs` installed. To retrieve
the code and start developing, run the following:

```bash
# Download the source code.
git clone https://github.com/maelys-mcardle/adventure

# Switch to the repository.
cd adventure

# Get the dependencies.
npm install
```

To start adventure while developing:

`npm run adventure`

The game will present an empty prompt. You can load a sample story 
with the `start` command:

`> start examples/thehouse`

Use the `help` command to get a listing of all possible commands.