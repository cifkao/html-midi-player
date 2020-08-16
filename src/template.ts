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
<div class="controls stopped" part="control-panel">
  <button class="play" part="play-button">
    <img src="${playIcon}" class="play-icon">
    <img src="${stopIcon}" class="stop-icon">
  </button>
  <div part="time"><span class="current-time" part="current-time">0:00</span> / <span class="total-time" part="total-time">0:00</span></div>
  <input type="range" min="0" value="0" step="any" class="seek-bar" part="seek-bar">
</div>
`;
