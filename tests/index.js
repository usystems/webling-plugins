import { createApp } from 'https://unpkg.com/vue@^3.0.11/dist/vue.esm-browser.js';

/**
 * @type IWeblingPluginInstances
 */
let weblingInstances;

/**
 * @type IWeblingPluginConfig
 */
let pluginConfig;

/**
 * @type IWeblingPluginState
 */
let pluginState;

class PluginTestConfig extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this.isConnected) {
			createApp({
				template: `
					<link href="/css/plugins.css" rel="stylesheet">
					<div>
						<button @click="count++" class="button--primary">count in config: {{ count }}</button>
						<button @click="close" class="button">Schliessen</button>
					</div>
				`,
				computed: {
					count: {
						get() { return pluginConfig.get().count || 0; },
						async set(count) { await pluginConfig.set({ count }); }
					}
				},
				methods: {
					close: () => {
						this.shadowRoot.dispatchEvent(new CustomEvent('close-dialog', { bubbles: true, composed: true }));
					}
				}
			}).mount(this.shadowRoot);
		}
	}
}

class PluginTestNavigation extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this.isConnected) {
			createApp({
				template: `
					<link href="/css/plugins.css" rel="stylesheet">
					<div>
						<button @click="count++" class="button--primary">count in config: {{ count }}</button>
					</div>
				`,
				computed: {
					count: {
						get() { return (pluginState.get() || {}).count || 0; },
						async set(count) { await pluginState.set({ count }); }
					}
				}
			}).mount(this.shadowRoot);
		}
	}
}

class PluginTestAccountingNavigation extends HTMLElement {
	static get observedAttributes() { return ['period-id']; }

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this.isConnected) {
			const app = createApp({
				template: `
					<link href="/css/plugins.css" rel="stylesheet">
					<div>
						<div>In Periode <em>{{periodLabel}}</em></div>
						<button @click="count++" class="button--primary">count in config: {{ count }}</button>
					</div>
				`,
				data: () => ({
					periodId: this.getAttribute('period-id'),
					periodLabel: ''
				}),
				computed: {
					count: {
						get() { return (pluginState.get() || {}).count || 0; },
						async set(count) { await pluginState.set({ count }); }
					}
				},
				watch: {
					periodId: {
						async handler() {
							if (this.periodId.length > 0 && this.periodId !== '0') {
								const period = await weblingInstances.period.load(parseInt(this.periodId));
								this.periodLabel = period.label;
							}
						},
						immediate: true
					},
				}
			}).mount(this.shadowRoot);
			this.setPeriodId = periodId => {
				app.periodId = periodId;
			}
		}
	}

	async attributeChangedCallback() {
		if (typeof this.setPeriodId === 'function') {
			this.setPeriodId(this.getAttribute('period-id'))
		}
	}
}

export default {
	name: 'com.webling.plugin.test',
	apiversion: 1,
	pluginversion: '1.0.0',
	hooks: [{
		hook: 'plugin-config',
		tagName: 'plugin-test-config',
		dialogTitle: 'Mitglieder auf einer Karte anzeigen Plugin',
	}, {
		hook: 'member-panel-navigation',
		label: 'Test Plugin',
		tagName: 'plugin-test-navigation'
	}, {
		hook: 'accounting-panel-navigation',
		label: 'Test Plugin',
		tagName: 'plugin-test-accounting-navigation'
	}, {
		hook: 'document-panel-navigation',
		label: 'Test Plugin',
		tagName: 'plugin-test-navigation'
	}],
	async onLoad(context) {
		weblingInstances = context.instances;
		pluginConfig = context.config;
		pluginState = context.state;
		customElements.define('plugin-test-config', PluginTestConfig);
		customElements.define('plugin-test-navigation', PluginTestNavigation);
		customElements.define('plugin-test-accounting-navigation', PluginTestAccountingNavigation);
	}
}
