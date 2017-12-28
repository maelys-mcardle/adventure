# Getting Started

## Overview

Adventure is a tool to create and play text adventure games. In these 
games, there is a protagonist that is controlled by a player. The protagonist 
explores a world, solves puzzles, talks to characters, and does all the things
you might read in a book. The player controls the protagonist by writing 
sentences in plain English. The game understands these sentences and writes
out text about what happens next.

The documentation aims to provide information necessary to play and write games.
This getting started guide aims only to be able to get to the point of launching
a game.

## Installing Adventure

The instructions for installing Adventure differ for playing and writing games.
For playing games, it's only necessary to load the Adventure executable. For
writing games, the instructions will also download examples and this 
documentation.

### If you're only playing games

Make sure [NodeJS](https://nodejs.org/) is installed. Then open a command-line
prompt and run the following command:

`npm install -g https://github.com/maelys-mcardle/adventure`

Test that Adventure runs by executing the following in a command-line prompt:

`adventure`

The game will present an empty prompt that looks like this:

`> `

Use the `exit` command to quit.

`> exit`

### If you're going to write games

Make sure [NodeJS](https://nodejs.org/) and [Git](https://git-scm.com/) are
installed. To retrieve the code and start developing, run the following in 
a command-line prompt:

```bash
# Download the source code.
git clone https://github.com/maelys-mcardle/adventure

# Switch to the repository.
cd adventure

# Get the dependencies.
npm install
```

Test that Adventure runs by executing the following in the same command-line
prompt:

`npm run adventure`

The game will present an empty prompt that looks like this:

`> `

Use the `exit` command to quit.

`> exit`

## Playing a game

To play a game, start Adventure:

```bash
# If installed with npm -g (for those only playing games)
adventure

# If installed with git (for those writing games)
npm run adventure
```

Then load the game. For those who installed Adventure with the intent
to write games, there is an examples directory. Stories can be loaded 
from that:

```
> load examples/thehouse
```

Otherwise, stories are loaded by specifying the directory that contains
the story, or a save file:

```
> load path/to/story
```

If the story loaded succesfully, the player should be greeted with content:

```
"The House" by Maëlys McArdle

You are in the bedroom. It hasn't changed since your childhood. Your pink
bed sheets. The blue walls. Your plush animals. Your polly pocket and
transformers lining the shelves. Traces of your teenage self - the boxes
of video games you kept perfectly. The computer you built, and rebuilt.
An entire life that suddenly stops midway through university.

A letter is on the bedside table.

You can:
 describe world
 go to the upstairs hallway
 read the letter
>
```

Use the `help` command to get a listing of built-in commands for Adventure.