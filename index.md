---
---

<div>
<midi-visualizer type="piano-roll" id="mainVisualizer" src="https://cdn.jsdelivr.net/gh/cifkao/html-midi-player@2b12128/jazz.mid"></midi-visualizer>
<midi-player src="https://cdn.jsdelivr.net/gh/cifkao/html-midi-player@2b12128/jazz.mid" sound-font visualizer="#mainVisualizer" id="mainPlayer">
</midi-player>
</div>

<p>
<label for="midiFile">Load MIDI file:</label>
<input type="file" id="midiFile" name="midiFile" accept="audio/midi, audio/x-midi">
</p>

<div markdown="1" style="margin-top: 5ex;">
## Getting started

1. Add the necessary scripts to your page:

   ```html
   <script src="https://cdn.jsdelivr.net/combine/npm/tone@14.7.58,npm/@magenta/music@1.23.1/es6/core.js,npm/focus-visible@5,npm/html-midi-player@1.4.0"></script>
   ```

2. Add a player and (optionally) a visualizer:

   ```html
   <midi-player
     src="https://magenta.github.io/magenta-js/music/demos/melody.mid"
     sound-font visualizer="#myVisualizer">
   </midi-player>
   <midi-visualizer type="piano-roll" id="myVisualizer"></midi-visualizer>
   ```

That's it!

`html-midi-player` is available for free under the BSD-2-Clause license.
If you use `html-midi-player` on your website, please consider linking back to [the repository](https://github.com/cifkao/html-midi-player/).

For more information, see the [readme](https://github.com/cifkao/html-midi-player#readme).

## Simple demo

<p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="WNwpLzL" data-user="cifkao" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/cifkao/pen/WNwpLzL">
  HTML MIDI Player Basic Example</a> by Ondřej Cífka (<a href="https://codepen.io/cifkao">@cifkao</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>


## Advanced demo

<p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="GRZxqZN" data-user="cifkao" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/cifkao/pen/GRZxqZN">
  HTML MIDI Player Advanced Examples</a> by Ondřej Cífka (<a href="https://codepen.io/cifkao">@cifkao</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
</div>


<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>
