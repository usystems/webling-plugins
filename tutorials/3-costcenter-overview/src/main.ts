import { createApp } from 'vue'
import App from './App.vue'
import css from './style.css';

let styleElement: HTMLStyleElement | null = null;
if (import.meta.hot) {
	const styleElements: HTMLStyleElement[] = <HTMLStyleElement[]>[...<any>document.head.children]
		.filter(node => node.nodeType === 1 && node.nodeName.toLowerCase() === 'style')
		.filter(node => node.innerHTML === css);
	if (styleElements.length === 1) {
		styleElement = styleElements[0];
		if (styleElement.parentElement instanceof HTMLElement) {
			styleElement.parentElement.removeChild(styleElement);
		}
	}
}

class PluginCostcenterOverview extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this.isConnected) {

			const shadowRootAsEl: HTMLElement = <any>this.shadowRoot;
			createApp(App).mount(shadowRootAsEl);

			if (import.meta.hot) {
				if (styleElement !== null) {
					if (styleElement.parentElement instanceof HTMLElement) {
						styleElement.parentElement.removeChild(styleElement);
					}
					shadowRootAsEl.appendChild(styleElement);
				}
			} else {
				styleElement = document.createElement('style');
				styleElement.setAttribute('type', 'text/css');
				styleElement.innerHTML = css;
				shadowRootAsEl.appendChild(styleElement);
			}
		}
	}
}

export default {
	name: 'com.webling.plugin.member-map',
	apiversion: 1,
	pluginversion: '1.0.0',
	hooks: [{
		hook: 'accounting-panel-navigation',
		label: 'Auswertung nach Kostenstelle',
		tagName: 'plugin-costcenter-overview-panel'
	}],
	async onLoad() {
		customElements.define('plugin-costcenter-overview-panel', PluginCostcenterOverview);
	}
}
