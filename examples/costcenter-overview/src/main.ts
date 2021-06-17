import { createApp } from 'vue'
import App from './App.vue'


class PluginCostcenterOverview extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this.isConnected) {
			createApp(App).mount(<any>this.shadowRoot);
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
