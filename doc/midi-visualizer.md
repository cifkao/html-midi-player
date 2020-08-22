# midi-visualizer

## Properties

| Property       | Attribute | Type                                     |
|----------------|-----------|------------------------------------------|
| `config`       |           | `VisualizerConfig`                       |
| `noteSequence` |           | `INoteSequence`                          |
| `src`          | `src`     | `string`                                 |
| `type`         | `type`    | `"piano-roll" \| "waterfall" \| "staff"` |

## Methods

| Method             | Type                                      |
|--------------------|-------------------------------------------|
| `clearActiveNotes` | `(): void`                                |
| `redraw`           | `(activeNote?: INote \| undefined): void` |
