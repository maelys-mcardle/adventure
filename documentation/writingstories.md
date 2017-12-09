# Writing Stories using Adventure

## Basic Concepts

### States

### Actions & Entities

## Writing a Story

### Story Project Structure

When writing stories there is a specific directory structure to be followed,
otherwise the game engine won't understand how to parse it. 

Each story project must have two directories: `actions` and 
`entities`. There also needs to be a `config.yml` file:

```
  story/
    |- actions/
    |- entities/
    |- config.yml
```

Actual stories will have many more files and directories. Take this sample
project:

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