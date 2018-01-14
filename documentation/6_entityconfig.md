# Entity Configuration (Continued)

<!-- TOC -->

- [Entity Configuration (Continued)](#entity-configuration-continued)
  - [Overview](#overview)
  - [Initially disabled values](#initially-disabled-values)
  - [Rules](#rules)
    - [Changing the property's value](#changing-the-propertys-value)
      - [".last" value](#last-value)
    - [Displaying a message](#displaying-a-message)
    - [Disabling and enabling values](#disabling-and-enabling-values)
    - [Conditional rules](#conditional-rules)
      - [When action](#when-action)
      - [When property value](#when-property-value)

<!-- /TOC -->

## Overview

This documentation continues the [entity configuration](4_entities.md) section
of the entity documentation. That covered the file itself, setting the initial
value for a property with `value`, the eligible actions for that property with 
`actions`, and specified child entities with `entities`.

As a quick refresher, entity configuration files are written in the 
[YAML language](https://en.wikipedia.org/wiki/YAML) and they look something
like the following:

```yaml
location:
  value: bedroom
  actions: [go, describe]
  rules:
    entrance -- lawn:
      when entrance.objects.door.door is closed:
        message: frontDoorNotOpen
        value: .last
    upstairsHallway -- masterBedroom:
      when masterBedroom.objects.door.door is closed:
        message: masterBedroomDoorLocked
        value: .last
  entities:
    bedroom:
      - objects.letter
    entrance:
      - objects.door
    lawn:
      - people.ada
    masterBedroom:
      - objects.door
```

The fields discussed in the entity documentation were sufficient to write
many stories; the material covered in this documentation allows for more
complex behaviour.

## Initially disabled values

A property can have one or more values. Sometimes, it is desirable to disable
some of these values. Disabling values means that for all intents and purposes, 
those values do not exist until such time as they are enabled again.

For instance, for a property representing a conversation, it could be desirable 
not to have all values immediately available. If, for example, the player
should only ask "What do you really think?" after having first asked "What
do you think?". 

All values would still be represented in the `values.dot` file:

```dot
graph conversation {
  idle -> whatDoYouThink
  idle -> whatDoYouReallyThink
}
```

Then in the `entity.yml` file, the question "What do you really think?" could
be disabled as such:

```yaml
conversation:
  value: idle
  actions: [say]
  disabled: [whatDoYouReallyThink]
```

## Rules

Rules allow for more complex entity behaviour. Rules are a set of statements
to be executed when a condition is met. They are defined in the `rules` field.
Here's an example `entity.yml` with a few rules:

```yaml
propertyName:
  value: someValue
  rules:
    someValue:
      message: messageOne
    oneValue -- anotherValue:
      message: messageTwo
```

Rules require a trigger. There are two kinds of triggers: value triggers and
transition triggers.

Value triggers, like `someValue` above, evaluate the statements beneath it
when the property's current value matches the value in the trigger. In the 
example above, `messageOne` is shown to the player when the property has
the value `someValue`.

Transition triggers, like `oneValue -- anotherValue` above, evaluate the
statements beneath it when the property transitions from one value to another
specified in the trigger. In the example above, when the property's value 
changes from `oneValue` to `anotherValue`, or from `anotherValue` to `oneValue`,
the `messageTwo` is shown to the player. 

Transition triggers support bidirectional transitions like 
`oneValue -- anotherValue` as well as unidirectional transitions like
`oneValue -> anotherValue`. The former would execute statements when the 
property transitions from the left value to the right value, or the right
value to the left value. The latter would only execute when the property
transitions from the left value to the right value.

### Changing the property's value

#### ".last" value

### Displaying a message

### Disabling and enabling values

### Conditional rules

#### When action

#### When property value