# Actions

<!-- TOC -->

- [Actions](#actions)
  - [About actions](#about-actions)
  - [Directory and file](#directory-and-file)
    - [Directory](#directory)
    - [File](#file)
  - [Name and path](#name-and-path)
  - [Types of actions](#types-of-actions)
    - [Transition](#transition)
    - [Description](#description)
  - [Fields](#fields)
    - [Action type](#action-type)
    - [Templates](#templates)
    - [Synonyms](#synonyms)
    - [Defaults](#defaults)

<!-- /TOC -->

## About actions

In the [documentation on entities](4_entities.md), it was said that stories
in Adventure are made up of things called entities. A car could be an entity.
A door could be an entity. A load of bread could be an entity. It was also
said that these entities had properties, which kept track of information
about the entity.

So a car might have a property to track whether the engine is running, a 
property to track whether the doors are open, and a property to track whether
the headlights are on. A door might have a property to track whether it is
open or closed. A loaf of bread might have a property to track how fresh it
is, and another to track how much of it was eaten.

Each of these properties have values, representing all the states the property
can be. So a the property for a door tracking whether it is open has two values:
`open` and `closed`. A property for a loaf of bread tracking how much of it
was eaten could have many values: `"no slice"`, `"1 slice"`, `"2 slices"`, 
`"3 slices"`, etc.

Here are some more examples of entities, their properties, and values:

```
  ENTITIES           PROPERTIES           VALUES
  ========           ==========           ======

  spaceship ---------  radar  ----------- enabled
               |                    |
               |                    ----- disabled
               |
               ------  thrusters  ------- full thrust
                                    |
                                    |---- half thrust
                                    |
                                    ----- off

  cat    -----------  feelings  --------- happy
                                    |
                                    |---- judgemental
                                    |
                                    ----- angry
```

Entities and values are fixed. They don't change. For stories to progress, 
things have to change. The protagonist has to move and interact with the world. 
This is all done using `actions` in Adventure.

Actions can change the value in an entity's property. For example, the world 
entity has a location property, which keeps track of where the protagonist
is situated. The "walk" action will change that value to something.

Say the values for the location are "dock", "beach", "road", and "cabin". The
walk action will make it so the protagonist goes from being at one place, like
the beach, to another, like the cabin.

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

In the game, each time the value changes, the game shows text for the new value.
This is the text that was specified in the entity text `.md` files, which was
convered in the [entities documentation](4_entities.md). If the location 
changes, text will be shown for the new location.

Actions are written in [YAML files](https://en.wikipedia.org/wiki/YAML). They
will look like this:

```yaml
do: transition
templates:
  - go to the @value
  - go to @value
  - go the @value
  - go @value
synonyms:
  go:
    - travel
    - walk
    - head
    - enter
```

These files will be placed in the `actions` directory and be named after
the action:

```
  story/
    |- actions/
    |     |- close.yml
    |     |- describe.yml
    |     |- open.yml
    |     |- walk.yml
    |
    |- entities/
    |- story.yml
```

## Directory and file

### Directory

Each action has its own `.yml` file and those are put in the `actions` 
directory. All the actions for all of the entities are put in this directory,
and it will look something like this:

```
  story/
    |- actions/
    |     |- close.yml
    |     |- describe.yml
    |     |- open.yml
    |     |- walk.yml
    |
    |- entities/
    |- story.yml
```

As more actions are added, for organizational purposes, sub-directories can
be created as well:

```
  story/
    |- actions/
    |     |- inspect/
    |     |    |- listen.yml
    |     |    |- look.yml
    |     |    |- smell.yml
    |     |
    |     |- movement/
    |          |- drive.yml
    |          |- walk.yml
    |
    |- entities/
    |- story.yml
```

Directory and action names should not contain any spaces, and by convention, 
are lower-case. Action names should be unique - it is advised against having
more than one action with the same name; for instance by having two `open.yml`
files in two sub-directories.

### File

Each action has its own `.yml` file, written in the 
[YAML language](https://en.wikipedia.org/wiki/YAML). The files look 
like the following:

```yaml
do: transition
templates:
  - say @value
  - say @entity @value
  - say to @entity @value
synonyms:
  say:
    - tell
    - speak
    - ask
```

## Name and path

The action name is the file name of the `.yml` defining the action.

```
  story/
    |- actions/
    |     |- close.yml
    |     |- describe.yml
    |     |- open.yml
    |     |- walk.yml
    |
    |- entities/
    |- story.yml
```

The actions in the example above would be `close`, `describe`, `open` and
`walk`.

If the actions are placed in a directory, the full path should be specified.
The path is the list of directories it takes to get from the `actions/` 
directory to the action `.yml` file, separated by dots (`.`). Take the 
following example:

```
  story/
    |- actions/
    |     |- inspect/
    |     |    |- listen.yml
    |     |    |- look.yml
    |     |    |- smell.yml
    |     |
    |     |- movement/
    |          |- drive.yml
    |          |- walk.yml
    |
    |- entities/
    |- story.yml
```

The path for the `listen` action would be `inspect.listen`. The path for the
`drive` action would be `movement.drive`.

Here are a few more examples of how directories translate to paths in
Adventure:

```
directory                         path in Adventure
---------                         -----------------
actions/describe.yml           -> describe
actions/car/turnon.yml         -> car.turnon
actions/body/eyes/blink.yml    -> body.eyes.blink
```

## Types of actions

There are two types of actions in Adventure: transition and description.

### Transition

Transition actions change the value of an entity's property. They also do
the following:

* Change the value of the property.
* Execute any rules for the transition from the old value to the new one.
* Output any text for the transition and the new value.
* Execute any rules for the new value.

### Description

Description actions output the text for the property's current value.

## Fields

### Action type

### Templates

### Synonyms

### Defaults
