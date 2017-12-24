# Writing Your First Story

## Basic concepts

### Adventure

Adventure is a tool to create and play text adventure games. In these 
games, there is a protagonist that is controlled by a player. The protagonist 
explores a world, solves puzzles, talks to characters, and does all the things
you might read in a book. The player controls the protagonist by writing 
sentences in plain English. The game understands these sentences and writes
out text about what happens next.

### Entities, properties and values

Stories in Adventure are made up of things, called `entities`. Everything is 
an entity in Adventure. The world the protagonist navigates is an entity. 
The door the protagonist might interact with is an entity. The protagonist's 
inventory is an entity.

Entities have one or more `properties`. These are pieces of information about
the entity. For instance, a car might have one property for the engine which
tracks whether the engine is on or off, and another for the doors to track 
whether they are down or up.

All the things properties can be - "on", "off", "locked", "unlocked" are 
called `values` in Adventure. Each entity must have at least one property, 
and each property must have at least one value.

```
  ENTITIES           PROPERTIES           VALUES
  ========           ==========           ======

  vehicle -----------  doors  ----------- locked
               |                    |
               |                    ----- unlocked
               |
               ------  engine  ---------- on
                                    |
                                    ----- off

  cat    -----------  feelings  --------- happy
                                    |
                                    |---- judgemental
                                    |
                                    ----- angry
```

### Actions

For stories to progress, things have to change. The protagonist has to move 
and interact with the world. This is all done using `actions` in Adventure.

Actions change the value in an entity's property. For example, the world 
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
So if the location changes, text will be shown for the new location. If the
protagonist were to arrive at the beach, it might look something like:

```
You are now at the beach.

The waves of the water gently roll against the fine sand.
```

If you don't understand how things work quite yet, don't worry. You don't
need to understand everything to write your first story. Follow the steps
below, explore, and try things out!

## Writing your first story

These instructions will put together a simple story set on a ferry.

### Before starting

Make sure you can run the `adventure` command. If you can't, follow the 
installation instructions in the README.

### Create the directories

Stories are stored in a directory. This directory must two sub-directories: 
`actions` and `entities`.

```
  myStory/
    |- actions/
    |- entities/
```

Go ahead and create a directory for your story. Then create the `actions` and
`entities` directories inside of it.

### Create the "story.yml" file

The most important file for Adventure is the `story.yml` file that's in the
main story directory. It is where important information like the title for the
story and the author is kept.

Create a `story.yml` file now. It should go in the main story directory:

```
  myStory/
    |- actions/
    |- entities/
    |- story.yml
```

Open the `story.yml` file and put the following inside:

```yml
title: My First Story
author: Maëlys McArdle
description: This story takes place on a ferry.
entity: ferry
```

Replace `Maëlys McArdle` with your name, and make up a new title instead of 
`My First Story`. Leave the rest there.

### Create the ferry entity

Go into the `entities` directory, and create another directory called `ferry`.
At this point, your story directory should look like so:

```
  myStory/
    |- actions/
    |- entities/
    |     |- ferry/
    |
    |- story.yml
```

Inside the `ferry` directory, create a file called `entity.yml`. Open this
file and put in the following:

```yaml
location:
  value: deck
```

The ferry entity has one property, called `location`. The current value is
the deck. Meaning, the protagonist's location is the deck.

Now create a file called `text.md`. Open this file and put in the following:

```markdown
# location

## deck

You are on the deck of the ferry.

The deck has a number of benches and chairs for passengers to use. It's
windy today, so few people are out here.

You look around. The ferry is surrounded by the ocean for as far as the
eye can see.
```

That file contains the things that will be written out by the game when
the protagonist is on the deck.

Finally, create a file called `values.dot`. Open this file and put in the
following:

```dot
graph location {
  deck
}
```

Your story directory should now look like so:

```
  myStory/
    |- actions/
    |- entities/
    |     |- ferry/
    |          |- entity.yml
    |          |- text.md
    |          |- values.dot
    |
    |- story.yml
```

### The .yml, .md, and .dot files

In the previous section, three different kinds of file were created to make
the entity.

The file that ends with `.dot` contains a list of all the properties, their
values, and how those values are connected. The file is written in the 
[DOT language](https://en.wikipedia.org/wiki/DOT_\(graph_description_language\)).
It's not really clear now, but as the story gets more complicated you should
have a better idea of how it works. Each entity can have one or more of these
files. It can be called anything, as long as it ends with `.dot` or `.gv`.

The file that end with `.md` contain text related to a property. If it's shown
as text when playing the game, it's defined here. The file is written in the 
[Markdown language](https://en.wikipedia.org/wiki/Markdown). Each entity can 
have one or more of these files. It can be called anything, as long as it ends
with `.md`.

The file that ends with `.yml` contains everything else that defines a property.
What value it should have at the start. What actions are applicable to it.
Rules that define special behaviours when certain things happen. The file is
written in the [YAML language](https://en.wikipedia.org/wiki/YAML). Each 
entity can have one or more of these files. It can be called anything, as long
as it ends with `.yml` or `.yaml`.

### Try it out!

You've got everything now to play this story. Start up Adventure:

```bash
adventure
```

Then run the command to load a new story.

```
start myStory
```

If your story directory not in the directory you're in, you'll need to specify
the path to the directory with the story. For example:

```
start /home/documents/myStory/
```

You should see the following if it works:

```
Loaded My First Story

You are on the deck of the ferry.

The deck has a number of benches and chairs for passengers to use. It's
windy today, so few people are out here.

You look around. The ferry is surrounded by the ocean for as far as the
eye can see.
```

At this point, there's nothing for the player to do. There needs to 
be another place for the player to be and an action to get there!

### Add a cabin

That second place for the protagonist to be will be a cabin. Open the ferry's
`values.dot` file, and edit the file to add the cabin like so:

```dot
graph location {
  deck -- cabin
}
```

The `--` between deck and cabin means that the two values are connected. When
in the `deck`, the protagonist will be able to go to the `cabin`.

Then edit the `text.md` file and edit it so it looks like so:

```markdown
# location

## deck

You are on the deck of the ferry.

The deck has a number of benches and chairs for passengers to use. It's
windy today, so few people are out here.

You look around. The ferry is surrounded by the ocean for as far as the
eye can see.

## cabin

You are on the cabin of the ferry.

The ship's captain is here, along with the first mate. They welcome passengers
to join them in the cabin, to see them steer and navigate the ship. There
are radar screens showing the clouds that surround the ship, and a few other
blips - perhaps other vessels in the distance.
```

### Create the walk action

The last piece now is to add a walk action. This action will change the values
in the `location` property of the `ferry` entity.

In the `actions` directory, add a `walk.yml` file. The story directory should
now look as such:

```
  myStory/
    |- actions/
    |     |- walk.yml
    |
    |- entities/
    |     |- ferry/
    |          |- entity.yml
    |          |- text.md
    |          |- values.dot
    |
    |- story.yml
```

Edit the `walk.yml` file so that it contains the following:

```yaml
do: transition
templates:
  - walk to the @value
  - walk to @value
  - walk @value
synonyms:
  walk:
    - go
    - run
```

Here `do: transition` means that this action will change the value of the
property to whatever the player specifies. 

The templates specify what the player can put in to trigger this action. 
`@value` is a sub-in for actual values. With this story, there would only
be two values so far: `deck` and `cabin`.

This means that if the player wanted to trigger this action, and walk to the
cabin from the deck, they could write:

```
walk to the cabin
walk to cabin
walk cabin
```

The synonyms are alternative words that could be used, in lieu of walk. And
so the following would also trigger the action:

```
go to the cabin
go to cabin
go cabin
run to the cabin
run to cabin
run cabin
```

### Try it out!

Let's try these changes out. Start up adventure.

```bash
adventure
```

Then run the command to load your story.

```
start myStory
```

You should be greeted with the following:

```
Loaded My First Story

You are on the deck of the ferry.

The deck has a number of benches and chairs for passengers to use. It's
windy today, so few people are out here.

You look around. The ferry is surrounded by the ocean for as far as the
eye can see.

You can:
 walk to the cabin
``` 

Now write `walk to the cabin` (or `go to the cabin` or whatnot). You should
see the following:

```
You are on the cabin of the ferry.

The ship's captain is here, along with the first mate. They welcome passengers
to join them in the cabin, to see them steer and navigate the ship. There
are radar screens showing the clouds that surround the ship, and a few other
blips - perhaps other vessels in the distance.

You can:
 walk to the deck
```

You did it!

### Adding more locations

