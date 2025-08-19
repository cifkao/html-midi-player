import * as mm from '@magenta/music/esm/core.js';
import {NoteSequence, INoteSequence} from '@magenta/music/esm/protobuf.js';

import {visualizerTemplate} from './assets';

const VISUALIZER_TYPES = ['piano-roll', 'waterfall', 'staff'] as const;
type VisualizerType = typeof VISUALIZER_TYPES[number];
type Visualizer = mm.PianoRollSVGVisualizer | mm.WaterfallSVGVisualizer | mm.StaffSVGVisualizer;


/**
 * MIDI visualizer element.
 *
 * The visualizer is implemented via SVG elements which support styling as described
 * [here](https://magenta.github.io/magenta-js/music/demos/visualizer.html).
 *
 * See also the
 * [`@magenta/music/core/visualizer` docs](https://magenta.github.io/magenta-js/music/modules/_core_visualizer_.html).
 *
 * @prop src - MIDI file URL
 * @prop type - Visualizer type
 * @prop lines - Number of lines in the visualizer (Only for `staff` type)
 * @prop noteSequence - Magenta note sequence object representing the currently displayed content
 * @prop config - Magenta visualizer config object
 */
export class VisualizerElement extends HTMLElement {
  private domInitialized = false;
  private initTimeout: number;

  protected wrapper: HTMLDivElement;
  protected visualizers: Visualizer[];
  protected lastChunkIndex: number = 0;

  protected ns: INoteSequence = null;
  protected _config: mm.VisualizerConfig = {};

  static get observedAttributes() { return ['src', 'type']; }

  connectedCallback() {
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(visualizerTemplate.content.cloneNode(true));

    if (this.domInitialized) {
      return;
    }
    this.domInitialized = true;

    this.wrapper = document.createElement('div');
    this.appendChild(this.wrapper);

    this.initVisualizerNow();
  }

  attributeChangedCallback(name: string, _oldValue: string, _newValue: string) {
    if (name === 'src' || name === 'type') {
      this.initVisualizer();
    }
  }

  protected initVisualizer() {
    if (this.initTimeout == null) {
      this.initTimeout = window.setTimeout(() => this.initVisualizerNow());
    }
  }

  protected async initVisualizerNow() {
    this.initTimeout = null;
    if (!this.domInitialized) {
      return;
    }
    if (this.src) {
      this.ns = null;
      this.ns = await mm.urlToNoteSequence(this.src);
    }

    this.wrapper.innerHTML = '';

    if (!this.ns) {
      return;
    }

    if (this.type === 'piano-roll') {
      this.wrapper.classList.add('piano-roll-visualizer');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.wrapper.appendChild(svg);
      this.visualizers = [new mm.PianoRollSVGVisualizer(this.ns, svg, this._config)];
    } else if (this.type === 'waterfall') {
      this.wrapper.classList.add('waterfall-visualizer');
      this.visualizers = [new mm.WaterfallSVGVisualizer(this.ns, this.wrapper, this._config)];
    } else if (this.type === 'staff') {
      this.wrapper.classList.add('staff-visualizer');
      this.visualizers = [];
      const chunkSize = Math.ceil(this.ns.notes.length / this.lines);
      for (let i = 0; i < this.ns.notes.length; i += chunkSize) {
        const chunk = structuredClone(this.ns.notes.slice(i, i + chunkSize));
        let startTime = chunk[0].startTime;
        chunk.forEach(n => {n.startTime -= startTime;n.endTime -= startTime;});
        const div = document.createElement('div');
        this.wrapper.appendChild(div);
        const new_ns = structuredClone(this.ns);
        new_ns.notes = chunk;
        this.visualizers.push(new mm.StaffSVGVisualizer(new_ns, div, this._config));
      }
    }
  }

  reload() {
    this.initVisualizerNow();
  }

  redraw(activeNote?: NoteSequence.INote) {
    if (this.visualizers) {
      if (this.type == "staff") {
        let chunkIndex = Math.floor(this.ns.notes.indexOf(activeNote) / Math.ceil(this.ns.notes.length / this.lines));
        if (chunkIndex != this.lastChunkIndex) {
          this.visualizers[this.lastChunkIndex].redraw(activeNote, false); // clearActiveNotes() doesn't work
          this.lastChunkIndex = chunkIndex;
        }
        const note = structuredClone(activeNote);
        note.startTime -= this.ns.notes[chunkIndex * Math.ceil(this.ns.notes.length / this.lines)].startTime;
        this.visualizers[chunkIndex].redraw(note, activeNote != null);
      }
      else {
        this.visualizers.forEach(visualizer => visualizer.redraw(activeNote, activeNote != null));
      }
    }
  }

  clearActiveNotes() {
    if (this.visualizers) {
      this.visualizers.forEach(visualizer => visualizer.clearActiveNotes());
    }
  }

  get noteSequence() {
    return this.ns;
  }

  set noteSequence(value: INoteSequence | null) {
    if (this.ns == value) {
      return;
    }
    this.ns = value;
    this.removeAttribute('src');  // Triggers initVisualizer only if src was present.
    this.initVisualizer();
  }

  get src() {
    return this.getAttribute('src');
  }

  set src(value: string | null) {
    this.ns = null;
    this.setOrRemoveAttribute('src', value);  // Triggers initVisualizer only if src was present.
    this.initVisualizer();
  }

  get type() {
    let value = this.getAttribute('type');
    if ((VISUALIZER_TYPES as readonly string[]).indexOf(value) < 0) {
      value = 'piano-roll';
    }
    return value as VisualizerType;
  }

  set type(value: VisualizerType) {
    if (value != null && VISUALIZER_TYPES.indexOf(value) < 0) {
      throw new Error(
        `Unknown visualizer type ${value}. Allowed values: ${VISUALIZER_TYPES.join(', ')}`);
    }
    this.setOrRemoveAttribute('type', value);
  }

  get lines() {
    let lines = Number(this.getAttribute('lines'))
    return lines == 0 ? 1 : lines;
  }

  set lines(value: number) {
    this.setOrRemoveAttribute('lines', value.toString() == '0' ? null : value.toString());
  }

  get config() {
    return this._config;
  }

  set config(value: mm.VisualizerConfig) {
    this._config = value;
    this.initVisualizer();
  }

  protected setOrRemoveAttribute(name: string, value: string) {
    if (value == null) {
      this.removeAttribute(name);
    } else {
      this.setAttribute(name, value);
    }
  }
}
