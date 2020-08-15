import {controlsTemplate} from './template';


class MagentaPlayerComponent extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot.appendChild(controlsTemplate.content.cloneNode(true));
  }

}

window.customElements.define('midi-player', MagentaPlayerComponent);
