# html-midi-player
`<midi-player>` and `<midi-visualizer>` HTML elements powered by [@magenta/music](https://github.com/magenta/magenta-js/tree/master/music/), fully stylable and scriptable.

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
