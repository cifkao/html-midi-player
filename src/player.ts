import * as mm from '@magenta/music/esm/core.js';
import {NoteSequence, INoteSequence} from '@magenta/music/esm/protobuf.js';

import {controlsTemplate} from './assets';
import * as utils from './utils';
import {VisualizerElement} from './visualizer';


export type NoteEvent = CustomEvent<{note: NoteSequence.INote}>;
const VISUALIZER_EVENTS = ['play', 'pause', 'note'] as const;
const DEFAULT_SOUNDFONT = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';

let playingPlayer: PlayerElement = null;


/**
 * MIDI player element.
 * See also the [`@magenta/music/core/player` docs](https://magenta.github.io/magenta-js/music/modules/_core_player_.html).
 *
 * The element supports styling using the CSS [`::part` syntax](https://developer.mozilla.org/docs/Web/CSS/::part)
 * (see the list of shadow parts [below](#css-shadow-parts)). For example:
 * ```css
 * midi-player::part(control-panel) {
 *     background: aquamarine;
 *     border-radius: 0px;
 * }
 * ```
 *
 * @prop src - MIDI file URL
 * @prop soundFont - Magenta SoundFont URL, an empty string to use the default SoundFont, or `null` to use a simple oscillator synth
 * @prop noteSequence - Magenta note sequence object representing the currently loaded content
 * @prop loop - Indicates whether the player should loop
 * @prop currentTime - Current playback position in seconds
 * @prop duration - Content duration in seconds
 * @prop paused - Indicates whether the player is currently paused
 * @prop playing - Indicates whether the player is currently playing
 * @attr visualizer - A selector matching `midi-visualizer` elements to bind to this player
 *
 * @fires load - The content is loaded and ready to play
 * @fires play - The player has started playing
 * @fires pause - The player has paused playing
 * @fires stop - The player has stopped playing
 * @fires loop - The player has automatically restarted playback after reaching the end
 * @fires note - A note starts
 *
 * @csspart control-panel - `<div>` containing all the controls
 * @csspart play-button - Play button
 * @csspart time - Numeric time indicator
 * @csspart current-time - Elapsed time
 * @csspart total-time - Total duration
 * @csspart seek-bar - `<input type="range">` showing playback position
 * @csspart loading-overlay - Overlay with shimmer animation
 */
export class PlayerElement extends HTMLElement {
  private domInitialized = false;
  private initTimeout: number;
  private needInitNs = false;

  protected player: mm.BasePlayer;
  protected controlPanel: HTMLElement;
  protected playButton: HTMLButtonElement;
  protected seekBar: HTMLInputElement;
  protected currentTimeLabel: HTMLInputElement;
  protected totalTimeLabel: HTMLInputElement;
  protected visualizerListeners = new Map<VisualizerElement, {[name: string]: EventListener}>();

  protected ns: INoteSequence = null;
  protected _playing = false;
  protected seeking = false;
  protected _lastError: any = null; // TODO: should we follow MediaError interface?

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
        this.play();
      }
    });
    this.seekBar.addEventListener('input', () => {
      // Pause playback while the user is manipulating the control
      this.seeking = true;
      this.dispatchEvent(new CustomEvent('seeking'));
      if (this.player?.getPlayState() === 'started') {
        this.player.pause();
      }
    });
    this.seekBar.addEventListener('change', () => {
      const time = this.currentTime;  // This returns the seek bar value as a number
      this.currentTimeLabel.textContent = utils.formatTime(time);
      if (this.player?.isPlaying()) {
        this.player.seekTo(time);
        if (this.player.getPlayState() === 'paused') {
          this.player.resume();
        }
      }
      this.seeking = false;
      this.dispatchEvent(new CustomEvent('seeked'));
    });

    this.initPlayerNow();
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (!this.hasAttribute(name)) {
      newValue = null;
    }

    if (name === 'sound-font' || name === 'src') {
      this.initPlayer();
    } else if (name === 'visualizer') {
      const fn = () => { this.setVisualizerSelector(newValue); };
      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', fn);
      } else {
        fn();
      }
    }
  }

  protected initPlayer(initNs = true) {
    this.needInitNs = this.needInitNs || initNs;
    if (this.initTimeout == null) {
      this.stop();
      this.setLoading();
      this.initTimeout = window.setTimeout(() => this.initPlayerNow(this.needInitNs));
    }
  }

  protected async initPlayerNow(initNs = true) {
    this.initTimeout = null;
    this.needInitNs = false;
    if (!this.domInitialized) {
      return;
    }

    try {
      let ns: INoteSequence = null;
      if (initNs) {
        if (this.src) {
          this.dispatchEvent(new CustomEvent('loadstart'));
          this.ns = null;
          this.ns = await mm.urlToNoteSequence(this.src);
        }
        this.currentTime = 0;
        if (!this.ns) {
          this.setError('No content loaded');
          this.dispatchError('No content loaded');
        }
      }
      ns = this.ns;

      if (ns) {
        this.seekBar.max = String(ns.totalTime);
        this.totalTimeLabel.textContent = utils.formatTime(ns.totalTime);
        this.dispatchEvent(new CustomEvent('durationchange'));
      } else {
        this.seekBar.max = '0';
        this.totalTimeLabel.textContent = utils.formatTime(0);
        this.dispatchEvent(new CustomEvent('durationchange'));
        return;
      }

      let soundFont = this.soundFont;
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

      this.setLoaded();
      this.dispatchEvent(new CustomEvent('loadeddata'));
      if (this.src) {
        this.dispatchEvent(new CustomEvent('canplay'));
        if (this.autoplay) {
          await this.play();
        }
      }
    } catch (error) {
      this.setError(String(error));
      this.dispatchError(error);
      throw error;
    }
  }

  load() {
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/load
    // resets the media element to its initial state and
    // begins the process of selecting a media source and loading the media in preparation for playback to begin at the beginning.
    this.initPlayerNow();
  }

  reload() {
    this.load(); // same behavior with load
  }

  async play() {
    this._start(); // not use `await` (because it waits for ended timing)

    // `play` event fired when
    //    the paused prop is changed from true to false,
    //    as a result of the play method,
    //    or the autoplay attribute.
    this.dispatchEvent(new CustomEvent('play'));
  }

  protected async _start(looped = false) {
    if (!this.player) {
      return;
    }

    if (this.player.getPlayState() == 'stopped') {
      if (playingPlayer && playingPlayer.playing && !(playingPlayer == this && looped)) {
        playingPlayer.stop();
      }
      playingPlayer = this;
      this._playing = true;

      let offset = this.currentTime;
      // Jump to the start if there are no notes left to play.
      if (this.ns.notes.filter((note) => note.startTime > offset).length == 0) {
        offset = 0;
      }
      this.currentTime = offset;

      this.controlPanel.classList.remove('stopped');
      this.controlPanel.classList.add('playing');
      try {
        // Force reload visualizers to prevent stuttering at playback start
        for (const visualizer of this.visualizerListeners.keys()) {
          if (visualizer.noteSequence != this.ns) {
            visualizer.noteSequence = this.ns;
            visualizer.reload();
          }
        }

        const promise = this.player.start(this.ns, undefined, offset);
        // fired after playback is first started, and whenever it is restarted
        this.dispatchEvent(new CustomEvent('playing'));
        if (looped) {
          this.dispatchEvent(new CustomEvent('loop'));
        }
        await promise;
        this.handleStop(true);
        this.dispatchEvent(new CustomEvent('ended'));
      } catch (error) {
        this.handleStop();
        this.dispatchError(error);
        throw error;
      }
    } else if (this.player.getPlayState() == 'paused') {
      this.player.resume();
      // fired after playback is first started, and whenever it is restarted
      this.dispatchEvent(new CustomEvent('playing'));
    }
  }

  pause() {
    if (this.player && this.player.isPlaying()) {
      this.player.pause();
    }
    this.handleStop(false);
  }

  stop() {
    if (this.player && this.player.isPlaying()) {
      this.player.stop();
    }
    this.handleStop(true);
  }

  addVisualizer(visualizer: VisualizerElement) {
    const listeners = {
      play: () => { visualizer.noteSequence = this.noteSequence; },
      pause: () => { visualizer.clearActiveNotes(); },
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
    if (this.seeking) {
      return;
    }
    this.seekBar.value = String(note.startTime);
    this.currentTimeLabel.textContent = utils.formatTime(note.startTime);
    this.dispatchEvent(new CustomEvent('timeupdate'));
  }

  protected dispatchError(error?: unknown) {
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/error_event
    this._lastError = error; // TODO: implement MediaError interface
    this.dispatchEvent(new CustomEvent('error'));
  }

  protected handleStop(finished = false) {
    if (finished) {
      if (this.loop) {
        this.currentTime = 0;
        this._start(true);
        return;
      }
      this.currentTime = this.duration;
    }
    this.controlPanel.classList.remove('playing');
    this.controlPanel.classList.add('stopped');
    if (this._playing) {
      this._playing = false;
      this.dispatchEvent(new CustomEvent('pause', {detail: {finished}}));
    }
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
    if (selector != null) {
      for (const element of document.querySelectorAll(selector)) {
        if (!(element instanceof VisualizerElement)) {
          console.warn(`Selector ${selector} matched non-visualizer element`, element);
          continue;
        }

        this.addVisualizer(element);
      }
    }
  }

  protected setLoading() {
    this.playButton.disabled = true;
    this.seekBar.disabled = true;
    this.controlPanel.classList.remove('error');
    this.controlPanel.classList.add('loading', 'frozen');
    this.controlPanel.removeAttribute('title');
  }

  protected setLoaded() {
    this.controlPanel.classList.remove('loading', 'frozen');
    this.playButton.disabled = false;
    this.seekBar.disabled = false;
  }

  protected setError(error: string) {
    this.playButton.disabled = true;
    this.seekBar.disabled = true;
    this.controlPanel.classList.remove('loading', 'stopped', 'playing');
    this.controlPanel.classList.add('error', 'frozen');
    this.controlPanel.title = error;
  }

  get noteSequence() {
    return this.ns;
  }

  set noteSequence(value: INoteSequence | null) {
    if (this.ns == value) {
      return;
    }
    this.ns = value;
    this.removeAttribute('src');  // Triggers initPlayer only if src was present.
    this.initPlayer();
  }

  get autoplay(): boolean {
    return this.hasAttribute('autoplay');
  }

  set autoplay(value: boolean) {
    this.setOrRemoveAttribute('autoplay', value ? '' : null);
  }

  get src() {
    return this.getAttribute('src');
  }

  set src(value: string | null) {
    this.ns = null;
    this.setOrRemoveAttribute('src', value);  // Triggers initPlayer only if src was present.
    this.initPlayer();
  }

  get error(): MediaError | null {
    return this._lastError;
  }

  /**
   * @attr sound-font
   */
  get soundFont() {
    return this.getAttribute('sound-font');
  }

  set soundFont(value: string | null) {
    this.setOrRemoveAttribute('sound-font', value);
  }

  /**
   * @attr loop
   */
  get loop() {
    return this.getAttribute('loop') != null;
  }

  set loop(value: boolean) {
    this.setOrRemoveAttribute('loop', value ? '' : null);
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

  get paused() {
    return this.player?.getPlayState() === 'paused';
  }

  canPlayType(type: unknown): string {
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/canPlayType
    // return type: '' | 'maybe' | 'probably';
    // TODO: consider 'maybe' return case in some cases.
    return typeof type === 'string' && (
      type === 'audio/midi' || type === 'audio/x-midi'
    ) ? 'probably' : '';
  }

  fastSeek(seconds: number) {
    this.currentTime = seconds;
  }

  protected setOrRemoveAttribute(name: string, value: string) {
    if (value == null) {
      this.removeAttribute(name);
    } else {
      this.setAttribute(name, value);
    }
  }
}
