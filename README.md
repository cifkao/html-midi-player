# html-midi-player

[![npm package](https://badge.fury.io/js/html-midi-player.svg)](https://badge.fury.io/js/html-midi-player)
[![npm package daily downloads](https://badgen.net/npm/dm/html-midi-player)](https://npmjs.com/package/html-midi-player)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/html-midi-player/badge?style=rounded)](https://www.jsdelivr.com/package/npm/html-midi-player)
[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/html-midi-player)

[`<midi-player>`](https://github.com/cifkao/html-midi-player/blob/master/doc/midi-player.md#midi-player)
and [`<midi-visualizer>`](https://github.com/cifkao/html-midi-player/blob/master/doc/midi-visualizer.md#midi-visualizer)
HTML elements powered by [@magenta/music](https://github.com/magenta/magenta-js/tree/master/music/) (Magenta.js), fully stylable and scriptable.

Works in Jupyter notebooks, Colab, and Weights & Biases thanks to the [midi-player](https://github.com/drscotthawley/midi-player) Python package by [@drscotthawley](https://github.com/drscotthawley).

* [Simple demo](https://codepen.io/cifkao/pen/WNwpLzL)
* [Advanced demo](https://codepen.io/cifkao/pen/GRZxqZN)
* [Website](https://cifkao.github.io/html-midi-player/) [[source](https://github.com/cifkao/html-midi-player/tree/www)] with MIDI file upload

Notable websites that use `html-midi-player` include [abcnotation.com](https://abcnotation.com/), [Musical Nexus](https://musicalnexus.net/) and demo websites for music generation models: [piano infilling](https://jackyhsiung.github.io/piano-infilling-demo/), [stochastic positional encoding](https://cifkao.github.io/spe/).

If you use `html-midi-player` on your website, please consider linking back to [the repository](https://github.com/cifkao/html-midi-player/).

## Getting started

1. Add the necessary scripts to your page:

   ```html
   <script src="https://cdn.jsdelivr.net/combine/npm/tone@14.7.58,npm/@magenta/music@1.23.1/es6/core.js,npm/html-midi-player@1.5.0"></script>
   ```

2. Add a player and a visualizer:

   <!---
   ```
   <custom-element-demo>
     <template>
       <script src="https://cdn.jsdelivr.net/combine/npm/tone@14.7.58,npm/@magenta/music@1.23.1/es6/core.js,npm/html-midi-player@1.5.0"></script>
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

Besides [jsDelivr](https://www.jsdelivr.com/package/npm/html-midi-player), the bundle is also available from [cdnjs](https://cdnjs.com/libraries/html-midi-player).

### Installing from NPM

You can also add the package to your project from NPM, e.g. `npm install --save html-midi-player` or `yarn add html-midi-player`. Then you can either:
- `import 'html-midi-player'` in your JavaScript code (as an ES Module), or
- add the `node_modules/html-midi-player/dist/midi-player.min.js` bundle directly to your page, along with the dependencies (`node_modules/tone/build/Tone.js`, `node_modules/@magenta/music/es6/core.js`; note that these need to go *before* `html-midi-player`).

## API basics

The basic features of `html-midi-player` are explained below. Wherever both HTML and JavaScript examples are given, they are equivalent. In the JavaScript examples, `player` and `visualizer` refer to the corresponding custom element objects, which can be obtained using standard DOM methods like `document.getElementById('#myPlayer')` or `document.querySelectorAll('midi-player')`, for example.

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
  To obtain a `NoteSequence`, you can use Magenta functions like [`urlToNoteSequence()`](https://magenta.github.io/magenta-js/music/modules/_core_.html#urltonotesequence) (see [FAQ](#how-do-i-create-and-manipulate-notesequences)).

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

Each visualizer type has a set of settings that can be specified using the `config` attribute (only from JavaScript), e.g.:
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

### Events
The player supports listening to different kinds of events using the `player.addEventListener()` method. See the [API reference](https://github.com/cifkao/html-midi-player/blob/master/doc/midi-player.md#events) for the available event types.

## FAQ
Here are some frequently asked questions about `html-midi-player`. Make sure to also check [discussions](https://github.com/cifkao/html-midi-player/discussions) and [issues](https://github.com/cifkao/html-midi-player/issues?q=is%3Aissue) to see if your question is answered there.

### Why is my MIDI file not loading?
Please make sure that you provide a valid HTTP(S) URL, either absolute (beginning with `https://` or `http://`) or relative with respect to your HTML file (if hosted on the same server).

Local files most likely **will not work**, as most browsers block requests to local files. To test the MIDI player locally, you will need to start an HTTP server to host your MIDI file; see for example [this tutorial](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Tools_and_setup/set_up_a_local_testing_server#running_a_simple_local_http_server) for easy ways to do that.

To diagnose why the MIDI file is not loading, hover over the error icon to see the error; if the message is "Bad MIDI file. Expected 'MHdr'", it means either your file is not a valid MIDI file, or the server cannot find your file and is serving an error page instead. To see the file actually being served, open your browser's Developer Tools, go to the Network tab, reload the page, then find the name of your file in the list.

### How can I use custom samples?
The player supports "SoundFonts" in a [special format](https://github.com/magenta/magenta-js/blob/d8a76682abb0979b985e4b80f6b68b5123b9f8d5/music/src/core/soundfont.ts#L381-L419) designed by Magenta. If you want to use a .sf2 file, it will not work out of the box, but it is possible to convert it with some effort. See [this discussion thread](https://github.com/cifkao/html-midi-player/discussions/43) and especially [this answer](https://github.com/cifkao/html-midi-player/discussions/43#discussioncomment-5439676), which proposes a conversion script.

### How do I create and manipulate `NoteSequence`s?
The Magenta.js [`core`](https://magenta.github.io/magenta-js/music/modules/_core_.html) and [`core/sequences`](https://magenta.github.io/magenta-js/music/modules/_core_sequences_.html) modules define functions for loading and manipulating `NoteSequence`s. To load a MIDI file as a `NoteSequence`, use the `urlToNoteSequence()` function. Other useful functions are `clone()`, `trim()` and `concatenate()`. 

If you are using the provided bundle as suggested [above](#getting-started), then the `core` module will be available simply as `core`, so you will be able to call e.g. `core.urlToNoteSequence()` or `core.sequences.clone()` from your code.

### Can you implement feature X or fix issue Y?
This library is a relatively thin wrapper around [Magenta.js](https://github.com/magenta/magenta-js/), which provides all of the MIDI loading, synthesis and visualization functionality. This means it inherits most of its limitations. If you found an issue, try to check if Magenta.js is also affected, e.g. using [this](https://magenta.github.io/magenta-js/music/demos/player.html) or [this](https://magenta.github.io/magenta-js/music/demos/visualizer.html) demo (click *Load MIDI File* to upload your own file). If the issue is still there, then this is most likely a Magenta.js issue and cannot be fixed here (although a workaround may be possible). Otherwise, feel free to open an issue (or even better, a pull request) here, but please check for existing [issues](https://github.com/cifkao/html-midi-player/issues?q=is%3Aissue) and [discussions](https://github.com/cifkao/html-midi-player/discussions) first.

## Limitations
- Only one player can play at a time. Starting a player will stop any other player which is currently playing. ([#1](https://github.com/cifkao/html-midi-player/issues/1))
  This can actually be a benefit in many cases.
- Playback position only gets updated on note onsets. This may cause the player to appear stuck.
