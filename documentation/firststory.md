# Writing Your First Story

## Basic Concepts

### Adventure

Adventure is a tool to create and play text adventure games. In these 
games, there is a protagonist that is controlled by a player. The protagonist 
explores a world, solves puzzles, get past monsters, and all the things you
might read a character do. The player controls the protagonist by writing 
sentences, which the game understands, and the game responds in kind by 
spitting out text about what happens next.

### Entities, Properties and Values

Stories in Adventure are made up of things, called `entities`. Everything is 
an entity in Adventure. The world the protagonist navigates is an entity. 
The door the protagonist might interact with is an entity. The protagonist's 
inventory is an entity. Entities can contain entities: the world (an entity) 
can contain a door (another entity).

Entities have one or more `properties`. These are bits of information about
the entity. For instance, for a car, it might have one property that keeps 
track of whether the engine is on or off, and another to keep track of whether
its doors are locked or unlocked. 

These individual states "on", "off", "locked", "unlocked" are called `values`
in Adventure. Each property must have at least one value.

```
  ENTITIES           PROPERTIES           VALUES
  ========           ==========           ======

  vehicle -----------   lock   ---------- locked
               |                    |
               |                    ----- unlocked
               |
               ------  engine  ---------- on
                                    |
                                    ----- off

  door   -----------  position  --------- completely open
                                    |
                                    |---- half open
                                    |
                                    ----- closed
```

As an example, the door **entity** has a **property** for position, with 
**values** "completely open", "half open" and "closed".

### Actions

For the story to progress, the protagonist has to be able to interact with 
the world and its contents.

This is done by using `actions`. Actions change the value of an entity's 
property. Take the engine property for the vehicle entity. It has two values: 
on and off.

```
  -- engine ---------------------------------------------
  |                                                     |
  |     |=====| ---------- start ----------> |====|     |
  |     | OFF |                              | ON |     |
  |     |=====| <---------- stop ----------- |====|     |
  |                                                     |
  -------------------------------------------------------
```

There are two actions: start and stop. The start action will change the value
from off to on. The stop action will change the value from on to off.

The same action can be used to go between all the values too. In the example
below, the walk action is used to change the protagonists location. In the
example below, the entity is called world, the property is called location,
and the values are "dock", "beach", "cabin" and "road".

```
  -- location -------------------------------------------
  |                                                     |
  |     |======|                         |=======|      |
  |     | DOCK | --------- walk -------- | BEACH |      |
  |     |======|                         |=======|      |
  |                                        |   |        |
  |        --------------- walk ------------  walk      |
  |        |                                   |        |
  |     |======|                         |=======|      |
  |     | ROAD | --------- walk -------- | CABIN |      |
  |     |======|                         |=======|      |
  |                                                     |
  -------------------------------------------------------
```

What the diagram above means is that the protagonist can walk from the dock
to the beach, from the beach to the road, from the beach to the cabin, and
from the cabin to the road. The protagonist cannot walk from the road to the
dock. 

## Writing Your First Story

### Prerequesites

This assumes that you can already run the `adventure` command. Installation
instructions are covered in the README.

### Creating the Directories

Stories are stored in a directory. This directory must have a `story.yml` file,
as well as two sub-directories: `actions` and `entities`.

```
  story/
    |- actions/
    |- entities/
    |- story.yml
```

As stories become more complex, these directories will become populated with
more files and subdirectories and might look something like this:

```
  story/
    |- actions/
    |     |- talk.yml
    |     |- walk.yml
    |
    |- entities/
    |     |- people/
    |     |    |- jay/
    |     |    |   |- entity.yml
    |     |    |   |- text.md
    |     |    |   |- values.dot
    |     |    |  
    |     |    |- joy/
    |     |        |- ...
    |     |
    |     |- world/
    |          |- house.yml
    |          |- houseText.md
    |          |- houseValues.dot
    |          |- mall.yml
    |          |- mallText.md
    |          |- mallValues.dot
    |
    |- story.yml
```

So go ahead and create a directory for your story. Then go into that
directory, and create two other directories `actions` and `entities`.

### Create story.yml File

The most important file for Adventure is the `story.yml` file that's in the
main story directory. It is where important information like the title for the
story and the author is kept. 

Create a `story.yml` file now. In it, copy and paste the following:

```yml
title: Simple Story
author: Maëlys McArdle
description: A story to demonstrate the game engine.
entity: world
```

Then replace the `Maëlys McArdle` with your name, and make up a new title
instead of `Simple Story`. You can leave the rest there.

### Create the World Entity

Go into the `entities` directory, and create another directory called `world`.
At this point, your story directory should look like so:

```
  story/
    |- actions/
    |- entities/
    |     |- world/
    |
    |- story.yml
```

