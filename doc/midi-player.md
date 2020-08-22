# midi-player

MIDI player element.
See also the [`@magenta/music/core/player` docs](https://magenta.github.io/magenta-js/music/modules/_core_player_.html).

## Attributes

| Attribute    | Description                                      |
|--------------|--------------------------------------------------|
| `visualizer` | A selector matching `midi-visualizer` elements to bind to this player |

## Properties

| Property       | Attribute    | Type                    | Description                                      |
|----------------|--------------|-------------------------|--------------------------------------------------|
| `currentTime`  |              | `number`                | Current playback position in seconds             |
| `duration`     |              | `number`                | Content duration in seconds                      |
| `noteSequence` |              | `INoteSequence \| null` | Magenta note sequence object representing the currently loaded content |
| `playing`      |              | `boolean`               | Indicates whether the player is currently playing |
| `soundFont`    | `sound-font` | `string \| null`        | Magenta SoundFont URL, an empty string to use the default SoundFont, or `null` to use a simple oscillator synth |
| `src`          | `src`        | `string \| null`        | MIDI file URL                                    |

## Methods

| Method             | Type                                    |
|--------------------|-----------------------------------------|
| `addVisualizer`    | `(visualizer: VisualizerElement): void` |
| `removeVisualizer` | `(visualizer: VisualizerElement): void` |
| `start`            | `(): void`                              |
| `stop`             | `(): void`                              |

## Events

| Event   | Type                                  | Description                             |
|---------|---------------------------------------|-----------------------------------------|
| `load`  |                                       | The content is loaded and ready to play |
| `note`  | `CustomEvent<{ note: INote; }>`       | A note starts                           |
| `start` |                                       | The player has started playing          |
| `stop`  | `CustomEvent<{ finished: boolean; }>` | The player has stopped playing          |
