# midi-player

MIDI player element.
See also the [`@magenta/music/core/player` docs](https://magenta.github.io/magenta-js/music/modules/_core_player_.html).

The element supports styling using the CSS [`::part` syntax](https://developer.mozilla.org/docs/Web/CSS/::part)
(see the list of shadow parts [below](#css-shadow-parts)). For example:
```css
midi-player::part(control-panel) {
     background: aquamarine;
     border-radius: 0px;
}
```

## Attributes

| Attribute    | Description                                      |
|--------------|--------------------------------------------------|
| `visualizer` | A selector matching `midi-visualizer` elements to bind to this player |

## Properties

| Property       | Attribute    | Type                    | Description                                      |
|----------------|--------------|-------------------------|--------------------------------------------------|
| `currentTime`  |              | `number`                | Current playback position in seconds             |
| `duration`     |              | `number`                | Content duration in seconds                      |
| `loop`         | `loop`       | `boolean`               | Indicates whether the player should loop         |
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

| Event   | Type                                  | Description                                      |
|---------|---------------------------------------|--------------------------------------------------|
| `load`  |                                       | The content is loaded and ready to play          |
| `loop`  |                                       | The player has automatically restarted playback after reaching the end |
| `note`  | `CustomEvent<{ note: INote; }>`       | A note starts                                    |
| `start` |                                       | The player has started playing                   |
| `stop`  | `CustomEvent<{ finished: boolean; }>` | The player has stopped playing                   |

## CSS Shadow Parts

| Part              | Description                                      |
|-------------------|--------------------------------------------------|
| `control-panel`   | `<div>` containing all the controls              |
| `current-time`    | Elapsed time                                     |
| `loading-overlay` | Overlay with shimmer animation                   |
| `play-button`     | Play button                                      |
| `seek-bar`        | `<input type="range">` showing playback position |
| `time`            | Numeric time indicator                           |
| `total-time`      | Total duration                                   |
