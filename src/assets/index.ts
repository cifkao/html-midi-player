/// <reference path="imports.d.ts"/>
import playIcon from './play.svg';
import stopIcon from './stop.svg';
import controlsCSS from './controls.scss';

export const controlsTemplate = document.createElement('template');
controlsTemplate.innerHTML = `
<style>
${controlsCSS}
</style>
<div class="controls stopped frozen" part="control-panel">
  <button class="play" part="play-button" disabled>
    <span class="icon play-icon">${playIcon}</span>
    <span class="icon stop-icon">${stopIcon}</span>
  </button>
  <div part="time"><span class="current-time" part="current-time">0:00</span> / <span class="total-time" part="total-time">0:00</span></div>
  <input type="range" min="0" max="0" value="0" step="any" class="seek-bar" part="seek-bar" disabled>
</div>
`;
