# Entities

In Adventure, every _thing_ in a story is defined in an entity. The world the 
protagonist inhabits is defined in an entity. The house they walk to is 
defined in an entity. The door they interact with is defined in an entity.

Entities are one of the two main building blocks of stories in Adventure.
Entities define what things are, and how they can change. Actions, the other
main building block in Adventure, does the changing.

## Directory

Each entity must have its own directory. This directory will then contain
files for the entity. The name and path of the entity are defined by the
directory they're in. For instance, take the entity in the directory below:

```
  story/
    |- actions/
    |- entities/
    |     |- characters/
    |          |- elizabeth/
    |                |- entity.yml
    |                |- text.md
    |                |- values.dot
    |
    |- story.yml
```

The entity name would be `elizabeth` and is taken from the directory name. The
full path for the entity would be `characters.elizabeth`. The full path is
the list of directories it takes to get from the `entities/` directory to the
entity, separated by dots (`.`).

Here are a few more examples of how directories translate to paths in
Adventure:

```
directory                         path in Adventure
---------                         -----------------
entities/world                 -> world
entities/places/vancouver      -> places.vancouver
entities/universe/earth/canada -> universe.earth.canada
```

## Files

Entities are made 