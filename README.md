# html-midi-player
`<midi-player>` and `<midi-visualizer>` HTML elements powered by [@magenta/music](https://github.com/magenta/magenta-js/tree/master/music/) (Magenta.js), fully stylable and scriptable.

## Getting started

1. Put the necessary scripts in your `<head>` tag:

   ```html
   <!-- optional but recommended -->
   <script src="https://cdn.jsdelivr.net/npm/focus-visible@5/dist/focus-visible.min.js"></script>
 
   <!-- required -->
   <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/13.8.21/Tone.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/@magenta/music@1/es6/core.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/@magenta/music@1/es6/protobuf.js"></script>
   <script src="https://github.com/cifkao/html-midi-player/releases/download/v0.0.1/html-midi-player.js"></script>
   ```

2. Add a player and a visualizer to `<body>`:

   ```html
   <midi-player
     src="https://magenta.github.io/magenta-js/music/demos/melody.mid"
     sound-font visualizer="#myVisualizer">
   </midi-player>
   <midi-visualizer type="piano-roll" id="myVisualizer"></midi-visualizer>
   ```

That's it!


## Usage

### `src` and `noteSequence`
Both `midi-player` and `midi-visualizer` support two different ways of specifying the input file:
- By setting the `src` attribute to a MIDI file URL, e.g.:
  ```html
  <midi-player src="twinkle-twinkle.mid"></midi-player>
  ```
  ```javascript
  player.src = "twinkle-twinkle.mid";
  ```
- By assigning a Magenta [`NoteSequence`](https://hello-magenta.glitch.me/#playing-a-notesequence) to the `noteSequence` property, e.g.:
  ```javascript
  player.noteSequence = TWINKLE_TWINKLE;
  ```

### SoundFonts
By default, the player will use a simple built-in synth. To use a SoundFont, add the `sound-font` attribute:
```html
<midi-player sound-font></midi-player>  <!-- default SoundFont (same as below) -->
<midi-player sound-font="https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus"></midi-player>
```
```javascript
player.soundFont = null;  // no SoundFont
player.soundFont = '';    // default SoundFont (same as below)
player.soundFont = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';
```
See the [Magenta.js docs](https://magenta.github.io/magenta-js/music/index.html#soundfonts) for a list of available SoundFonts.

### Visualizer types
The visualizer type is specified via the `type` attribute. Three visualizer types are supported: `piano-roll`, `waterfall` and `staff`.

### Binding visualizers
A player supports binding one or more visualizers to it using the `visualizer` attribute (a selector) or the `addVisualizer` method:
```html
<midi-player visualizer="#myVisualizer, #myOtherVisualizer"></midi-player>
```
```javascript
player.addVisualizer(document.getElementById('myVisualizer'));
player.addVisualizer(document.getElementById('myOtherVisualizer'));
```
The visualizer only gets updated while the player is playing, which allows a single visualizer to be bound to multiple players.

## Limitations
- Only one player can play at a time due to the way playback is implemented in Magenta.js. Starting a player will stop any other player which is currently playing.
- Seeking only works while playing. This is related to the first issue and caused by the same problem in Magenta.js.
- Playback position only gets updated on note onsets. This may cause the player to appear stuck.
