import { createApp } from 'https://unpkg.com/vue@^3.0.11/dist/vue.esm-browser.js';

let weblingAPI;
let config;

class SportdbExportDialog extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.isInitialized = false;
	}

	connectedCallback() {
		if (this.isConnected) {
			createApp({
				template: `<link href="/css/plugins.css" rel="stylesheet">
				<div>
					<h2>Mein Export</h2>
					<div class="description">Hier ein Beispiel Export.</div>
					<br>
					<a class="button--primary" v-if="loading" disabled>Download wird vorbereitet...</a>
					<a :href="'data:text/plain;charset=utf-8,' + fileContents" download="export.txt" class="button--primary" v-else>Download</a>
					<button @click="close" class="button">Schliessen</button>
				</div>`,
				mounted: async function() {
					const instances = await weblingAPI.member.list();
					instances.forEach(instance => {
						this.rows.push(instance.properties.Vorname);
					});
					this.loading = false;
				},
				data: () => {
					return {
						loading: true,
						rows: []
					}
				},
				methods: {
					close: () => {
						this.shadowRoot.dispatchEvent(new CustomEvent('close-dialog', { bubbles: true, composed: true }));
					}
				},
				computed: {
					fileContents: function() {
						return encodeURIComponent(this.rows.join(','));
					}
				}
			}).mount(this.shadowRoot);
		}
	}
}

class SportdbExportConfig extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.isInitialized = false;
	}

	connectedCallback() {
		if (this.isConnected) {
			createApp({
				template: `<link href="/css/plugins.css" rel="stylesheet">
				<div>
					<button @click="save" class="button--primary">Speichern</button>
					<button @click="close" class="button">Schliessen</button>
				</div>`,
				methods: {
					async save() {
						this.close();
					},
					close: () => {
						this.shadowRoot.dispatchEvent(new CustomEvent('close-dialog', { bubbles: true, composed: true }));
					}
				}
			}).mount(this.shadowRoot);
		}
	}
}

export default {
	name: 'com.webling.plugin.sportdb-export',
	apiversion: 1,
	pluginversion: '1.0.0',
	hooks: [{
		hook: 'plugin-config',
		tagName: 'plugin-sportdb-export-config'
	}, {
		hook: 'global-dialog',
		dialogTitle: 'Globaler Plugin Dialog',
		dialogWidth: 500,
		tagName: 'plugin-sportdb-export-dialog'
	}, {
		hook: 'member-list-menu-export',
		label: 'SportDB Export',
		callback: () => {
			location.hash = location.hash + '/:plugin/plugin-sportdb-export-dialog/1';
		}
	}],
	async onLoad(context) {
		weblingAPI = context.weblingAPI;
		config = context.config;
		customElements.define('plugin-sportdb-export-dialog', SportdbExportDialog);
		customElements.define('plugin-sportdb-export-config', SportdbExportConfig);
	}
}
