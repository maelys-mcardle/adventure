# Writing Stories using Adventure

## Basic Concepts

### Entities, Values, & Actions

Stories in Adventure are made up of things, called `entities`, and those
things have a state. A door can be in the open state, or a closed state. 
Entities can go between states in Adventure using `actions`. So the action
of closing a door, is what gets the door from the open state, to the closed
state. The entirety of all these states and being able to go between them is
called a [state machine](https://en.wikipedia.org/wiki/Finite-state_machine).

States, such as "open" and "closed" for the door are called `values` in 
Adventure. Everything in Adventure is an entity. The world that the player
moves around in is an entity, where each state is a location that the player
can be in. The world contains entities, called `child entities`, such as doors 
and non-playable characters. Each of these have their own set of states.

Stories in Adventure are, in short, nested state machines.

### Actions & Properties

Often, things have more than one set of states. For instance, an entity like
a vehicle can have states for having the engine on or off, but also being
unlocked or locked. 

To account for this, entities in Adventure have `properties` with these 
properties being individual state machines. The car in this case has two 
properties: one for the engine (with values on/off) and one for the lock 
(with values locked/unlocked).

All entities in Adventure have at least one property. The door has at one
property to track whether it is open, with two values: open/close. It could
have more, perhaps to track whether it is damaged/undamaged.

As such, actions apply to individual properties. Going back to the car example,
the engine property would have an action to turn the car on/off, whereas the
lock property would have an action to lock and another to unlock.

```
  ENTITIES           PROPERTIES           VALUES
  --------           ----------           ------

  vehicle ---------->   lock   ---------> locked
               |                    |
               |                    ----> unlocked
               |
               ----->  damage  ---------> damaged
                                    |
                                    ----> undamaged

  door   ----------->  status  ---------> open
                                    |
                                    ----> closed
```

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

### Root Config

