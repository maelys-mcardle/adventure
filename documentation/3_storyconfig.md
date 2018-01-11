# Story Configuration

<!-- TOC -->

- [Story Configuration](#story-configuration)
  - [Overview](#overview)
  - [Fields](#fields)
    - [Title](#title)
    - [Author](#author)
    - [Description](#description)
    - [Version](#version)
    - [Entity](#entity)
      - [Only one entity can be specified](#only-one-entity-can-be-specified)

<!-- /TOC -->

## Overview

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
the root entity - more on that below.

## Fields

The file is written using [YAML](https://en.wikipedia.org/wiki/YAML), and looks
like this:

```yaml
title: Untitled
author: Maëlys McArdle
description: A story to demonstrate the game engine.
entity: world
version: 1
```

The fields are as follows.

### Title

The `title` specifies the name for the story.

```yaml
title: A Dog's Life
```

If this field is not included, the story will be called `Untitled`.

### Author

The `author` field specifies author(s) for the story.

```yaml
authors: Julie Smith & Jane Smyth
```

If this field is not included, the authors will be `Anonymous`.

### Description

The `description` field specifies a single-line description for the story.

```yaml
description: The adventures of a dog bitten by a radioactive spider.
```

If this field is not included, the description will be blank.

### Version

Over time, software developers might add new features to Adventure. Some of
these changes might translate into small changes to the way stories are
written. The `version` field is a way to track which version of Adventure
the story was written for. This lets Adventure evolve without breaking your 
stories.

The current version of Adventure stories is `1`. If you write stories using
this documentation, you should specify:

```yaml
version: 1
```

If this field is not included, Adventure will assume you wrote the story
for the latest version of Adventure.

### Entity

The root entity. Entities are hiearchial in Adventure, containing
more entities. This would be the path for the entity at the top of the hiearchy.

The `entity` field in the `story.yml` file must specify the path of an entity.
This path is defined by the directory structure of the story. Let's say we 
want the `world` entity to be the root entity:

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
version: 1
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
version: 1
```

In Adventure, paths are separated with a dot `.` instead of a slash `/`:

```
directory                         path in Adventure
---------                         -----------------
entities/world                 -> world
entities/places/vancouver      -> places.vancouver
entities/universe/earth/canada -> universe.earth.canada
```

#### Only one entity can be specified

Only one entity, called the root entity, can be specified in the story 
configuration file. This is because entities in Adventure are hiearchial.
This means an entity can contain more entities, which can contain more 
entities - making a tree-like structure. The root entity is the one at
the very top.

```
                            orbit
                              |
          -----------------------------------------
          |                   |                   |
      spaceship           astronaut           satellite   
          |                   |
   ---------------        inventory
   |             |
airlock       engines          
```

Adventure works by going through the tree-like structure, starting from the 
root entity, `orbit` in the example above, and going to every child
entity (entity beneath it).

The entity structure is independent of the directory structure. Child entities
are specified in the entity's `entity.yml` file. So while the entity structure
looks like the above, the directory structure might look like this below:

```
  story/
    |- actions/
    |- entities/
    |     |- orbit/
    |     |- characters/
    |     |    |- astronaut/
    |     |    |     |- entity.yml
    |     |    |     |- text.md
    |     |    |     |- values.dot
    |     |    |
    |     |    |- inventory/
    |     |          |- entity.yml
    |     |          |- ...
    |     |
    |     |- objects/
    |          |- spaceship/
    |          |     |- entity.yml
    |          |     |- ...
    |          |
    |          |- satellite/
    |          |     |- ...
    |          |
    |          |- ...
    |
    |- story.yml
```

A story configuration file with `orbit` as the root entity could look 
like the following:

```yaml
title: Space is Cold
author: Maëlys McArdle
description: A story to demonstrate the game engine.
entity: orbit
version: 1
```