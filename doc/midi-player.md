# midi-player

## Attributes

| Attribute    |
|--------------|
| `visualizer` |

## Properties

| Property       | Attribute    | Modifiers | Type            |
|----------------|--------------|-----------|-----------------|
| `currentTime`  |              |           | `number`        |
| `duration`     |              | readonly  | `number`        |
| `noteSequence` |              |           | `INoteSequence` |
| `playing`      |              | readonly  | `boolean`       |
| `soundFont`    | `sound-font` |           | `string`        |
| `src`          | `src`        |           | `string`        |

## Methods

| Method             | Type                                    |
|--------------------|-----------------------------------------|
| `addVisualizer`    | `(visualizer: VisualizerElement): void` |
| `removeVisualizer` | `(visualizer: VisualizerElement): void` |
| `start`            | `(): void`                              |
| `stop`             | `(): void`                              |

## Events

| Event   | Type                                  |
|---------|---------------------------------------|
| `note`  | `CustomEvent<{ note: INote; }>`       |
| `start` |                                       |
| `stop`  | `CustomEvent<{ finished: boolean; }>` |
