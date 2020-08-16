import {controlsTemplate} from './template';
import * as mm from '@magenta/music/es6/core';
import {NoteSequence, INoteSequence} from '@magenta/music/es6/protobuf';


const DEFAULT_SOUNDFONT = 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';

const componentSet = new Set<MagentaPlayerComponent>();


class MagentaPlayerComponent extends HTMLElement {
  protected player: mm.BasePlayer;
  protected controlPanel: HTMLElement;
  protected seekBar: HTMLInputElement;

  private ns: NoteSequence;
  private _src: string;
  private _soundFont: string;

  static get observedAttributes() { return ['sound-font', 'src']; }

  constructor() {
    super();

    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(controlsTemplate.content.cloneNode(true));
    this.controlPanel = this.shadowRoot.querySelector('.controls');
    this.controlPanel.querySelector('.play').addEventListener('click', () => this.playClickCallback());
    this.seekBar = this.controlPanel.querySelector('.seek-bar');
    this.seekBar.addEventListener('input', () => {
      if (this.player && this.player.getPlayState() === 'started') {
        this.player.pause();
      }
    });
    this.seekBar.addEventListener('change', () => {
      this.currentTime = parseFloat(this.seekBar.value);
      if (this.player && this.player.getPlayState() === 'paused') {
        this.player.resume();
      }
    });
  }

  start() {
    if (this.player && !this.player.isPlaying()) {
      // Stop all other players
      for (const other of componentSet) {
        if (other !== this) {
          other.stop();
        }
      }

      this.controlPanel.classList.remove('stopped');
      this.controlPanel.classList.add('playing');
      this.player.start(this.ns).catch((error) => {
        console.error(error);
        this.stopCallback();
      });
    }
  }

  stop() {
    if (this.player && this.player.isPlaying()) {
      this.player.stop();
      this.stopCallback();
    }
  }

  connectedCallback() {
    componentSet.add(this);
    this.initPlayer();
  }

  disconnectedCallback() {
    this.stop();
    componentSet.delete(this);
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (!this.hasAttribute(name)) {
      newValue = null;
    }

    if (name === 'sound-font') {
      this.soundFont = newValue;
    } else if (name === 'src') {
      this.src = newValue;
    }
  }

  protected async initPlayer(initNs = true) {
    this.stop();
    if (!this.isConnected) {
      return;
    }

    var ns = this.ns;
    if (initNs) {
      if (this._src) {
        ns = await mm.urlToNoteSequence(this._src);
        this.ns = ns;
      }
      this.seekBar.value = '0';
      this.seekBar.max = String(this.ns.totalTime);
    }

    if (!this.ns) {
      return;
    }

    var soundFont = this._soundFont;
    const callbackObject = {
      // Call callbacks only if we are still playing the same note sequence.
      run: (n: NoteSequence.INote) => (this.ns === ns) && this.noteCallback(n),
      stop: () => (this.ns === ns) && this.stopCallback(true)
    };
    if (soundFont === null) {
      this.player = new mm.Player(false, callbackObject);
    } else {
      if (soundFont === "") {
        soundFont = DEFAULT_SOUNDFONT;
      }
      this.player = new mm.SoundFontPlayer(soundFont, undefined, undefined, undefined,
                                           callbackObject);
    }

    if (this.player instanceof mm.SoundFontPlayer) {
      this.player.loadSamples(this.ns);
    }
  }

  protected playClickCallback() {
    if (this.player.isPlaying()) {
      this.stop();
    } else {
      this.start();
    }
  }

  protected noteCallback(note: NoteSequence.INote) {
    this.seekBar.value = String(note.startTime);
  }

  protected stopCallback(finished = false) {
    if (finished) {
      this.seekBar.value = this.seekBar.max;
    }
    this.controlPanel.classList.remove('playing');
    this.controlPanel.classList.add('stopped');
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
    if (this.player && this.player.isPlaying()) {
      this.player.seekTo(value);
    }
  }
}

window.customElements.define('midi-player', MagentaPlayerComponent);
