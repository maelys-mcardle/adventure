# Writing Stories using Adventure

## Basic Concepts

### Entities, Properties and Values

Stories in Adventure are made up of things, and in Adventure things are
called `entities`. Everything is an entity in Adventure. The world the
protagonist navigates is an entity. The door the protagonist might interact with
is an entity. The protagonist's inventory is an entity. Entities can contain 
more entities: the world (an entity) can contain a door (another entity).

Entities can have multiple `properties`. These are bits of information about
the entity. For instance, for a car, it might have one property that keeps 
track of whether the engine is on or off, and another to keep track of whether
its doors are locked or unlocked. These individual states (on or off, locked
or unlocked) are called `values` in Adventure.

As another example, a door entity might have two properties: one to track
whether the door is open/closed, and the other to track whether it is
damaged/undamaged. 

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

  door   ------------  status  ---------- open
               |                    |
               |                    ----- closed
               |
               ------  damage  ---------- damaged
                                    |
                                    ----- undamaged
```

### Actions

The stories in Adventure are made up of things. But for the story to progress,
the protagonist has to be able to interact with these worlds. To navigate the 
world, interact with objects, etc.

The protagonist interacts with the world by using `actions`. Actions work
by changing the values for the properties of entities. Take the `engine`
property for the `vehicle` entity. It has two values: `on` and `off`.

```
  -- engine ---------------------------------------------
  |                                                     |
  |     |=====| ---------- start ----------> |====|     |
  |     | OFF |                              | ON |     |
  |     |=====| <---------- stop ----------- |====|     |
  |                                                     |
  -------------------------------------------------------
```

Actions can change the value for the property. If the value is `off`, the
`start` action on the `engine` property can set its value to `on`. Likewise,
the `stop` action can make the engine's value go from `on` to `off`.

Examples so far have had two values for each property, but there can be an
unlimited number of values for an unlimited number of properties. 

## Writing Your First Story

### Create a Directory

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
    |          |- house/
    |          |   |- entity.yml
    |          |   |- text.md
    |          |   |- values.dot
    |          | 
    |          |- street/
    |          |   |- ...
    |          | 
    |          |- mall/
    |              |- ...
    |
    |- story.yml
```

So go ahead and create a directory for your story. Then go into that
directory, and create an empty `story.yml` file as well as two other
directories `actions` and `entities`.

### Edit the story.yml File

The most important file for Adventure is the `story.yml` file that's in the
main story directory. The file will contain something like the following:

```yml
title: Simple Story
author: Maëlys McArdle
description: A story to demonstrate the game engine.
entity: world
```



