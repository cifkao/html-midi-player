import * as mm from '@magenta/music/es6/core';
import {NoteSequence, INoteSequence} from '@magenta/music/es6/protobuf';


const VISUALIZER_TYPES = ['piano-roll', 'waterfall', 'staff'] as const;
type VisualizerType = typeof VISUALIZER_TYPES[number];
type Visualizer = mm.PianoRollSVGVisualizer | mm.WaterfallSVGVisualizer | mm.StaffSVGVisualizer;


/**
 * MIDI visualizer element.
 * See also the [`@magenta/music/core/visualizer` docs](https://magenta.github.io/magenta-js/music/modules/_core_visualizer_.html).
 *
 * @prop src - MIDI file URL
 * @prop type - Visualizer type
 * @prop noteSequence - Magenta note sequence object representing the currently displayed content
 * @prop config - Magenta visualizer config object
 */
export class VisualizerElement extends HTMLElement {
  private domInitialized = false;
  private initTimeout: number;

  protected wrapper: HTMLDivElement;
  protected visualizer: Visualizer;

  protected ns: INoteSequence;
  protected _config: mm.VisualizerConfig = {};

  static get observedAttributes() { return ['src', 'type']; }

  connectedCallback() {
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
      this.visualizer = new mm.PianoRollSVGVisualizer(this.ns, svg, this._config);
    } else if (this.type === 'waterfall') {
      this.wrapper.classList.add('waterfall-visualizer');
      this.visualizer = new mm.WaterfallSVGVisualizer(this.ns, this.wrapper, this._config);
    } else if (this.type === 'staff') {
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

  set noteSequence(value: INoteSequence | null) {
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
