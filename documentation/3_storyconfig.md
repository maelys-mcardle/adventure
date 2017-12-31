# Story Configuration

There is a file called `story.yml` in the story's root directory, alongside
the `actions` and `entities` sub-directories:

```
  story/
    |- actions/
    |- entities/
    |- story.yml
```

This `story.yml` is the story's configuration file. It contains the main
information for a story, such as its title and author. It also specifies
which is the main entity. 

## File contents

The file is written using [YAML](https://en.wikipedia.org/wiki/YAML), and looks
like this:

```yaml
title: Untitled
author: Maëlys McArdle
description: A story to demonstrate the game engine.
entity: world
```

The fields are as follows:

**title**: The name for the story.
**author**: The author(s) for the story.
**description**: A short, one or two sentence description for the story.
**entity**: The root entity. Entities are hiearchial in Adventure, containing
more entities. This would be the path for the entity at the top of the hiearchy.

## More on the "entity" field

The `entity` field in the `story.yml` file must specify the path of an entity.
This path is defined by the directory structure of the story. Let's say we 
wamt the `world` entity to be the root entity:

```
  story/
    |- actions/
    |- entities/
    |     |- world/
    |          |- entity.yml
    |          |- text.md
    |          |- values.dot
    |
    |- story.yml
```

The entity name would be `world`:

```yaml
title: Untitled
author: Maëlys McArdle
description: A story to demonstrate the game engine.
entity: world
```

But let's say the entity was in a subdirectory:

```
  story/
    |- actions/
    |- entities/
    |     |- places/
    |          |- vancouver/
    |                |- entity.yml
    |                |- text.md
    |                |- values.dot
    |
    |- story.yml
```

Then the entity name would be `places.vancouver`:

```yaml
title: Untitled
author: Maëlys McArdle
description: A story to demonstrate the game engine.
entity: places.vancouver
```

In Adventure, paths are separated with a dot `.` instead of a slash `/`:

```
directory                         path in adventure
---------                         -----------------
entities/world                 -> world
entities/places/vancouver      -> places.vancouver
entities/universe/earth/canada -> universe.earth.canada
```
