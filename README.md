# jvc-tv-api
> JavaScript API for interacting with JVC smart TVs

Simple module for interacting with JVC smart TVs (and probably other rebranded
Vestel smart TVs).

## Limitations

Thus far it looks like there is no way to get the TV's current state from any
APIs or status ports or the like.  This library will emit events when the power
state or source input state is changed **using the library itself**, but any
changes from external inputs (like the physical TV remote) won't trigger the
same events.  Therefore, the data from these events cannot be relied on as being
the true current state of the TV.

YMMV when trying to use this library.  It has only been tested against a single
TV, and is being published on GitHub so that a) it can be easily consumed by
other projects I'm working on; b) in the event it _may_ be useful to someone
else.

## Usage

```javascript
const { Search, TV } = require('jvc-tv-api')

const search = new Search()

search.on('tv', tv => {
  console.log(tv.name) // MyTV

  // Lower the volume
  tv.changeVolume(-5)

  // Select source
  tv.selectSource(2)

  // Press a specific key
  tv.pressKey(TV.BUTTON_MENU)

  // Turn the TV off
  tv.turnOff()
})

search.start()
```

## API

### Functions

#### `turnOn()`

Sends a magic Wake-on-Lan package to turn the TV on.

#### `turnOff()`

Sends the `BUTTON_POWER` key.

#### `togglePower()`

Turns the TV on or off.

#### `changeVolume(amount: integer)`

Change the volume by `amount`, eg:

```javascript
tv.changeVolume(5)  // Increase volume by 5
tv.changeVolume(-2) // Decrease volume by 2
```

#### `selectSource(number: integer)`

Switch the input to the specified source.  Sends the keys `BUTTON_SOURCE`
and the chosen source number (eg `BUTTON_1`).

#### `pressKey(key: string)/pressKeys(...keys: Array<string>)`

Send one or more keys to the TV, eg

```javascript
// Open the menu
tv.pressKey(TV.BUTTON_MENU)

// Press the home key, then the green key
tv.pressKeys(TV.BUTTON_HOME, TV.BUTTON_GREEN)
```

### Events

> #### IMPORTANT: events are only omitted when interacting with the TV through this library.  There is (seemingly) no way to get the same information that the events deliver directly from the TV, so any changes affected by anything other than this library will not be reflected (eg using the physical TV remote)

#### `'power' => (newPower: boolean)`

Emitted when the TV's power state changes.

```javascript
tv.on('powerChanged', newPower => {
  console.log(`The TV is ${newPower ? 'on' : 'off'}`)
})
```

#### `'source' => (newSource: integer)`

Emitted when the source is changed.

```javascript
tv.on('sourceChanged', newSource => {
  console.log(`Source input changed to ${newSource}`)
})
```

### Constants

#### `TV.BUTTON_*`

See [./src/keys.js](./src/keys.js) for a list a buttons that can be sent
using `pressKey()`.
