import * as mm from '@magenta/music/es6/core';
import {NoteSequence, INoteSequence} from '@magenta/music/es6/protobuf';


const VISUALIZER_TYPES = ['piano-roll', 'pianoroll', 'waterfall', 'staff'] as const;
type VisualizerType = typeof VISUALIZER_TYPES[number];
type Visualizer = mm.PianoRollSVGVisualizer | mm.WaterfallSVGVisualizer | mm.StaffSVGVisualizer;


export class VisualizerElement extends HTMLElement {
  protected domInitialized = false;
  protected wrapper: HTMLDivElement;
  protected visualizer: Visualizer;

  protected ns: INoteSequence;
  protected _src: string;
  protected _type: VisualizerType = 'pianoroll';
  protected _config: mm.VisualizerConfig = {};

  static get observedAttributes() { return ['src', 'type']; }

  connectedCallback() {
    if (this.domInitialized) {
      return;
    }
    this.domInitialized = true;
  
    this.wrapper = document.createElement('div');
    this.appendChild(this.wrapper);

    this.initVisualizer();
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (!this.hasAttribute(name)) {
      newValue = null;
    }

    if (name === 'src') {
      this.src = newValue;
    } else if (name === 'type') {
      this.type = newValue as VisualizerType;
    }
  }

  protected async initVisualizer() {
    if (!this.domInitialized) {
      return;
    }
    if (this._src) {
      this.ns = null;
      this.ns = await mm.urlToNoteSequence(this._src);
    }
    if (!this.ns) {
      return;
    }

    this.wrapper.innerHTML = '';

    if (this._type === 'piano-roll' || this._type === 'pianoroll') {
      this.wrapper.classList.add('piano-roll-visualizer');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.wrapper.appendChild(svg);
      this.visualizer = new mm.PianoRollSVGVisualizer(this.ns, svg, this._config);
    } else if (this._type === 'waterfall') {
      this.wrapper.classList.add('waterfall-visualizer');
      this.visualizer = new mm.WaterfallSVGVisualizer(this.ns, this.wrapper, this._config);
    } else if (this._type === 'staff') {
      this.wrapper.classList.add('staff-visualizer');
      const div = document.createElement('div');
      this.wrapper.appendChild(div);
      this.visualizer = new mm.StaffSVGVisualizer(this.ns, div, this._config);
    }
  }

  redraw(activeNote?: NoteSequence.INote) {
    if (this.visualizer) {
      this.visualizer.redraw(activeNote, activeNote != null);
    }
  }

  clearActiveNotes() {
    if (this.visualizer) {
      this.visualizer.clearActiveNotes();
    }
  }

  get noteSequence() {
    return this.ns;
  }

  set noteSequence(value: INoteSequence) {
    this.ns = value;
    this._src = null;
    this.initVisualizer();
  }

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    this.initVisualizer();
  }

  get type() {
    return this._type;
  }

  set type(value: VisualizerType) {
    if (VISUALIZER_TYPES.indexOf(value) < 0) {
      throw new Error(
        `Unknown visualizer type ${value}. Allowed values: ${VISUALIZER_TYPES.join(', ')}`);
    }
    this._type = value;
    this.initVisualizer();
  }

  get config() {
    return this._config;
  }

  set config(value: mm.VisualizerConfig) {
    this._config = value;
    this.initVisualizer();
  }
}
