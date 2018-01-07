# More on entity 

The text shown to the player is in a file written in the
[YAML language](https://en.wikipedia.org/wiki/YAML).

At their most simplest, they have the following format:

```yaml
propertyName:
  value: someValue
```

Where `propertyName` is the name of a property, and `value: someValue` means
that when that property is created, the first value it will have is `someValue`.

These files contain multiple fields, covered below.

### Value

The `value` field sets the initial value of the property.

```yaml
door:
  value: closed
```

In the example above, the initial value for the `door` property of the door
entity would be the value `closed`. This value must be listed in the `.dot`
file that has all the values.

### Actions

The `actions` field sets the actions that can be performed on the property.

See the documentation on actions for how to create the action files, which
are needed for this field to work. 

```yaml
door:
  value: ajar
  actions: [open, close, describe]
```

One or more actions can be defined. In the example above, again for the door,
the actions are `open`, `close` and `describe`.

The name of these actions are the file names for the actions in the `actions`
directory. So if there's this directory structure for the story:

```
  story/
    |- actions/
    |     |- close.yml
    |     |- describe.yml
    |     |- open.yml
    |
    |- entities/
    |     |- door/
    |          |- entity.yml
    |          |- text.md
    |          |- values.dot
    | 
    |- story.yml
```

The actions would be `close`, `describe` and `open`.

### Disable

### Entities

### Rules

#### "If" blocks

#### Enable

#### Disable

#### Actions

#### Value

#### Message