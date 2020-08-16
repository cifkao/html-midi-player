// @ts-ignore
import playIcon from 'data-url:./assets/play.svg';
// @ts-ignore
import stopIcon from 'data-url:./assets/stop.svg';
// @ts-ignore
import css from 'bundle-text:./assets/controls.scss';

export const controlsTemplate = document.createElement('template');
controlsTemplate.innerHTML = `
<style>
${css}
</style>
<div class="controls stopped frozen" part="control-panel">
  <button class="play" part="play-button" disabled>
    <img src="${playIcon}" class="icon play-icon">
    <img src="${stopIcon}" class="icon stop-icon">
  </button>
  <div part="time"><span class="current-time" part="current-time">0:00</span> / <span class="total-time" part="total-time">0:00</span></div>
  <input type="range" min="0" max="0" value="0" step="any" class="seek-bar" part="seek-bar" disabled>
</div>
`;
