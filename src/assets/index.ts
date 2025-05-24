/// <reference path="imports.d.ts"/>
import playIcon from './play.svg';
import pauseIcon from './pause.svg';
import errorIcon from './error.svg';
import controlsCSS from './controls.scss';
import visualizerCSS from './visualizer.scss';

export const controlsTemplate = document.createElement('template');
controlsTemplate.innerHTML = `
<style>
${controlsCSS}
</style>
<div class="controls stopped frozen" part="control-panel" role="region" aria-label="Player controls">
  <button class="play" part="play-button" aria-label="Play" disabled>
    <span class="icon play-icon" aria-hidden="true">${playIcon}</span>
    <span class="icon stop-icon" aria-hidden="true">${pauseIcon}</span>
    <span class="icon error-icon" aria-hidden="true">${errorIcon}</span>
  </button>
  <div part="time">
    <span class="current-time" part="current-time" aria-label="Elapsed time">0:00</span> / <span class="total-time" part="total-time" aria-label="Total time">0:00</span>
  </div>
  <input type="range" min="0" max="0" value="0" step="any" class="seek-bar" part="seek-bar" aria-label="Playback position" disabled>
  <div class="overlay loading-overlay" part="loading-overlay"></div>
</div>
`;

export const visualizerTemplate = document.createElement('template');
visualizerTemplate.innerHTML = `
<style>
${visualizerCSS}
</style>
<slot>
</slot>
`;
