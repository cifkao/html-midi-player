import * as mm from '@magenta/music/es6/core';
import {NoteSequence, INoteSequence} from '@magenta/music/es6/protobuf';

import {controlsTemplate} from './assets';
import * as utils from './utils';
import {VisualizerElement} from './visualizer';


export type NoteEvent = CustomEvent<{note: NoteSequence.Note}>;
const VISUALIZER_EVENTS = ['start', 'stop', 'note'] as const;
const DEFAULT_SOUNDFONT = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';

let playingPlayer: PlayerElement = null;


export class PlayerElement extends HTMLElement {
  protected domInitialized = false;
  protected player: mm.BasePlayer;
  protected controlPanel: HTMLElement;
  protected playButton: HTMLButtonElement;
  protected seekBar: HTMLInputElement;
  protected currentTimeLabel: HTMLInputElement;
  protected totalTimeLabel: HTMLInputElement;
  protected visualizerListeners = new Map<VisualizerElement, {[name: string]: EventListener}>();

  protected ns: NoteSequence;
  protected _src: string;
  protected _soundFont: string;
  protected _playing = false;

  static get observedAttributes() { return ['sound-font', 'src', 'visualizer']; }

  constructor() {
    super();

    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(controlsTemplate.content.cloneNode(true));

    this.controlPanel = this.shadowRoot.querySelector('.controls');
    this.playButton = this.controlPanel.querySelector('.play');
    this.currentTimeLabel = this.controlPanel.querySelector('.current-time');
    this.totalTimeLabel = this.controlPanel.querySelector('.total-time');
    this.seekBar = this.controlPanel.querySelector('.seek-bar');
  }

  connectedCallback() {
    if (this.domInitialized) {
      return;
    }
    this.domInitialized = true;

    const applyFocusVisiblePolyfill =
      (window as any).applyFocusVisiblePolyfill as (scope: Document | ShadowRoot) => void;
    if (applyFocusVisiblePolyfill != null) {
      applyFocusVisiblePolyfill(this.shadowRoot);
    }

    this.playButton.addEventListener('click', () => {
      if (this.player.isPlaying()) {
        this.stop();
      } else {
        this.start();
      }
    });
    this.seekBar.addEventListener('input', () => {
      // Pause playback while the user is manipulating the control
      if (this.player && this.player.getPlayState() === 'started') {
        this.player.pause();
      }
    });
    this.seekBar.addEventListener('change', () => {
      const time = this.currentTime;  // This returns the seek bar value as a number
      this.currentTimeLabel.textContent = utils.formatTime(time);
      if (this.player) {
        if (this.player.isPlaying()) {
          this.player.seekTo(time);
          if (this.player.getPlayState() === 'paused') {
            this.player.resume();
          }
        }
      }
    });

    this.initPlayer();
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (!this.hasAttribute(name)) {
      newValue = null;
    }

    if (name === 'sound-font') {
      this.soundFont = newValue;
    } else if (name === 'src') {
      this.src = newValue;
    } else if (name === 'visualizer') {
      const fn = () => { this.setVisualizerSelector(newValue); };
      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', fn);
      } else {
        fn();
      }
    }
  }

  protected async initPlayer(initNs = true) {
    if (!this.domInitialized) {
      return;
    }

    this.stop();
    this.freeze();

    let ns: NoteSequence = null;
    if (initNs) {
      if (this._src) {
        this.ns = null;
        this.ns = await mm.urlToNoteSequence(this._src);
      }
      this.currentTime = 0;
      this.seekBar.max = String(this.ns.totalTime);
      this.totalTimeLabel.textContent = utils.formatTime(this.ns.totalTime);
    }
    ns = this.ns;

    if (!ns) {
      return;
    }

    var soundFont = this._soundFont;
    const callbackObject = {
      // Call callbacks only if we are still playing the same note sequence.
      run: (n: NoteSequence.INote) => (this.ns === ns) && this.noteCallback(n),
      stop: () => {}
    };
    if (soundFont === null) {
      this.player = new mm.Player(false, callbackObject);
    } else {
      if (soundFont === "") {
        soundFont = DEFAULT_SOUNDFONT;
      }
      this.player = new mm.SoundFontPlayer(soundFont, undefined, undefined, undefined,
                                           callbackObject);
      await (this.player as mm.SoundFontPlayer).loadSamples(ns);
    }

    if (this.ns !== ns) {
      // If we started loading a different sequence in the meantime...
      return;
    }

    this.unfreeze();
  }

  start() {
    (async () => {
      if (this.player) {
        if (this.player.getPlayState() == 'stopped') {
          if (playingPlayer && playingPlayer.playing) {
            playingPlayer.stop();
          }
          playingPlayer = this;
          this._playing = true;

          this.controlPanel.classList.remove('stopped');
          this.controlPanel.classList.add('playing');
          try {
            const promise = this.player.start(this.ns);
            this.dispatchEvent(new CustomEvent('start'));
            await promise;
            this.handleStop(true);
          } catch (error) {
            this.handleStop();
            throw error;
          }
        } else if (this.player.getPlayState() == 'paused') {
          // This normally should not happen, since we pause playback only when seeking.
          this.player.resume();
        }
      }
    })();
  }

  stop() {
    if (this.player && this.player.isPlaying()) {
      this.player.stop();
    }
    this.handleStop();
  }

  addVisualizer(visualizer: VisualizerElement) {
    const listeners = {
      start: () => { visualizer.noteSequence = this.noteSequence; },
      stop: () => { visualizer.clearActiveNotes(); },
      note: (event: NoteEvent) => { visualizer.redraw(event.detail.note); },
    } as const;
    for (const name of VISUALIZER_EVENTS) {
      this.addEventListener(name, listeners[name]);
    }
    this.visualizerListeners.set(visualizer, listeners);
  }

  removeVisualizer(visualizer: VisualizerElement) {
    const listeners = this.visualizerListeners.get(visualizer);
    for (const name of VISUALIZER_EVENTS) {
      this.removeEventListener(name, listeners[name]);
    }
    this.visualizerListeners.delete(visualizer);
  }

  protected noteCallback(note: NoteSequence.INote) {
    if (!this.playing) {
      return;
    }
    this.dispatchEvent(new CustomEvent('note', {detail: {note}}));
    this.seekBar.value = String(note.startTime);
    this.currentTimeLabel.textContent = utils.formatTime(note.startTime);
  }

  protected handleStop(finished = false) {
    if (finished) {
      this.currentTime = this.duration;
    }
    this.controlPanel.classList.remove('playing');
    this.controlPanel.classList.add('stopped');
    this._playing = false;
    this.dispatchEvent(new CustomEvent('stop', {detail: {finished}}));
  }

  protected setVisualizerSelector(selector: string) {
    // Remove old listeners
    for (const listeners of this.visualizerListeners.values()) {
      for (const name of VISUALIZER_EVENTS) {
        this.removeEventListener(name, listeners[name]);
      }
    }
    this.visualizerListeners.clear();

    // Match visualizers and add them as listeners
    for (const element of document.querySelectorAll(selector)) {
      if (!(element instanceof VisualizerElement)) {
        console.warn(`Selector ${selector} matched non-visualizer element`, element);
        continue;
      }

      this.addVisualizer(element);
    }
  }

  protected freeze() {
    this.playButton.disabled = true;
    this.seekBar.disabled = true;
    this.controlPanel.classList.add('frozen');
  }

  protected unfreeze() {
    this.controlPanel.classList.remove('frozen');
    this.playButton.disabled = false;
    this.seekBar.disabled = false;
  }

  get noteSequence() {
    return this.ns;
  }

  set noteSequence(value: INoteSequence) {
    this.ns = NoteSequence.create(value);
    this._src = null;
    this.initPlayer();
  }

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    this.initPlayer();
  }

  get soundFont() {
    return this._soundFont;
  }

  set soundFont(value: string) {
    this._soundFont = value;
    this.initPlayer(false);
  }

  get currentTime() {
    return parseFloat(this.seekBar.value);
  }

  set currentTime(value: number) {
    this.seekBar.value = String(value);
    this.currentTimeLabel.textContent = utils.formatTime(this.currentTime);
    if (this.player && this.player.isPlaying()) {
      this.player.seekTo(value);
    }
  }

  get duration() {
    return parseFloat(this.seekBar.max);
  }

  get playing() {
    return this._playing;
  }
}
