# Writing Stories using Adventure

## Basic Concepts

### State Machines

Stories in Adventure are nested state machines.

Things in the story are in a given state - a door is open. Those things
can change to a different state - the door can become closed. 

Things in Adventure are called `entities`. Everything is an entity. The
door is an entity. The house that contains the door is an entity. The player
can be an entity.

The mechanism to go from one state to another - from the door being open to
the door being closed - are called `actions`. 

Stories are made up of things, those things can have multiple states, and
actions are what make things go from one state to another. That is the 
fundamental mechanism of this game engine.

### Actions & Entities

### Everything is an Entity

There are two

### Everything has a State



## Writing a Story

### Story Project Structure

Stories are stored in a directory. This directory must have a `config.yml` file,
as well as two sub-directories: `actions` and `entities`.

```
  story/
    |- actions/
    |- entities/
    |- config.yml
```

As stories become more complex, these directories will become populated with
files and subdirectories:

```
  story/
    |- actions/
    |     |- talk.yml
    |     |- walk.yml
    |
    |- entities/
    |     |- people/
    |     |    |- jay/
    |     |    |   |- config.yml
    |     |    |   |- state.dot
    |     |    |   |- text.md
    |     |    |  
    |     |    |- joy/
    |     |        |- ...
    |     |
    |     |- world/
    |          |- house/
    |          |   |- config.yml
    |          |   |- state.dot
    |          |   |- text.md
    |          | 
    |          |- street/
    |          |   |- ...
    |          | 
    |          |- mall/
    |              |- ...
    |
    |- config.yml
```

### Actions & Entities

The `actions` directory contains 