# html-midi-player

[![npm package](https://badge.fury.io/js/html-midi-player.svg)](https://badge.fury.io/js/html-midi-player)
[![npm package daily downloads](https://badgen.net/npm/dm/html-midi-player)](https://npmjs.com/package/html-midi-player)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/html-midi-player/badge?style=rounded)](https://www.jsdelivr.com/package/npm/html-midi-player)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/html-midi-player)

[`<midi-player>`](https://github.com/cifkao/html-midi-player/blob/master/doc/midi-player.md#midi-player)
and [`<midi-visualizer>`](https://github.com/cifkao/html-midi-player/blob/master/doc/midi-visualizer.md#midi-visualizer)
HTML elements powered by [@magenta/music](https://github.com/magenta/magenta-js/tree/master/music/) (Magenta.js), fully stylable and scriptable.

* [Simple demo](https://codepen.io/cifkao/pen/WNwpLzL)
* [Advanced demo](https://codepen.io/cifkao/pen/GRZxqZN)
* [Website](https://cifkao.github.io/html-midi-player/) [[source](https://github.com/cifkao/html-midi-player/tree/www)] with MIDI file upload

Notable websites that use `html-midi-player` include [abcnotation.com](https://abcnotation.com/), [Musical Nexus](https://musicalnexus.net/) and demo websites for music generation models: [piano infilling](https://jackyhsiung.github.io/piano-infilling-demo/), [stochastic positional encoding](https://cifkao.github.io/spe/).

If you use `html-midi-player` on your website, please consider linking back to [the repository](https://github.com/cifkao/html-midi-player/).

## Getting started

1. Add the necessary scripts to your page:

   ```html
   <script src="https://cdn.jsdelivr.net/combine/npm/tone@14.7.58,npm/@magenta/music@1.23.1/es6/core.js,npm/focus-visible@5,npm/html-midi-player@1.4.0"></script>
   ```

2. Add a player and a visualizer:

   <!---
   ```
   <custom-element-demo>
     <template>
       <script src="https://cdn.jsdelivr.net/combine/npm/tone@14.7.58,npm/@magenta/music@1.23.1/es6/core.js,npm/focus-visible@5,npm/html-midi-player@1.4.0"></script>
       <next-code-block></next-code-block>
     </template>
   </custom-element-demo>
   ```
   -->
   ```html
   <midi-player
     src="https://magenta.github.io/magenta-js/music/demos/melody.mid"
     sound-font visualizer="#myVisualizer">
   </midi-player>
   <midi-visualizer type="piano-roll" id="myVisualizer"></midi-visualizer>
   ```

That's it!

### Installing from NPM

You can also add the package to your project from NPM, e.g. `npm install --save html-midi-player` or `yarn add html-midi-player`. Then you can either:
- `import 'html-midi-player'` in your JavaScript code (as an ES Module), or
- add the `node_modules/html-midi-player/dist/midi-player.min.js` bundle directly to your page, along with the dependencies (`node_modules/tone/build/Tone.js`, `node_modules/@magenta/music/es6/core.js`; note that these need to go *before* `html-midi-player`).

In both cases, you should also add the [`focus-visible` polyfill](https://github.com/WICG/focus-visible) to enable outlines on keyboard focus.

## API basics

See also the API reference for both elements:
[`midi-player`](https://github.com/cifkao/html-midi-player/blob/master/doc/midi-player.md#midi-player),
[`midi-visualizer`](https://github.com/cifkao/html-midi-player/blob/master/doc/midi-visualizer.md#midi-visualizer).

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
By default, the player will use a simple oscillator synth. To use a SoundFont, add the `sound-font` attribute:
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

### Looping
To make the player loop, use the `loop` attribute:
```html
<midi-player loop></midi-player>
```
```javascript
player.loop = true;
```

### Visualizer settings
The visualizer type is specified via the `type` attribute. Three visualizer types are supported: `piano-roll`, `waterfall` and `staff`.

Each visualizer type has a set of settings that can be specified using the `config` attribute, e.g.:
```javascript
visualizer.config = {
  noteHeight: 4,
  pixelsPerTimeStep: 60,
  minPitch: 30
};
```
The settings are documented [in the Magenta.js docs](https://magenta.github.io/magenta-js/music/interfaces/_core_visualizer_.visualizerconfig.html).

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
- Only one player can play at a time. Starting a player will stop any other player which is currently playing. ([#1](https://github.com/cifkao/html-midi-player/issues/1))
  This can actually be a benefit in many cases.
- Playback position only gets updated on note onsets. This may cause the player to appear stuck.
