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

/**
 * @type IWeblingPluginPrefs
 */
let pluginPrefs;

class PluginTestConfig extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this.isConnected && this.shadowRoot.childElementCount === 0) {
			createApp({
				template: `
					<link href="/css/plugins.css" rel="stylesheet">
					<div>
						<button @click="incCount" :disabled="isSaving" class="button--primary">count in state: {{ count }}</button>
						<button @click="closeDialog" class="button">Schliessen</button>
					</div>
				`,
				data: () => ({
					isSaving: false,
					count: (pluginConfig.get() || {}).count || 0
				}),
				mounted: function() {
					pluginConfig.watch(() => {
						this.count = pluginConfig.get().count;
					});
				},
				methods: {
					incCount: async function() {
						this.isSaving = true;
						await pluginConfig.set({ count: this.count + 1 })
						this.isSaving = false;
					},
					closeDialog: () => {
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
		if (this.isConnected && this.shadowRoot.childElementCount === 0) {
			createApp({
				template: `
					<link href="/css/plugins.css" rel="stylesheet">
					<div>
						<button @click="incCountState" :disabled="isSaving" class="button--primary">count in state: {{ countState }}</button>
						<button @click="incCountPrefs" :disabled="isSaving" class="button--primary">count in prefs: {{ countPrefs }}</button>
					</div>
				`,
				data: () => ({
					isSaving: false,
					countState: (pluginState.get() || {}).count || 0,
					countPrefs: (pluginPrefs.get() || {}).count || 0
				}),
				mounted: function() {
					pluginState.watch(() => {
						this.countState = pluginState.get().count;
					});
					pluginPrefs.watch(() => {
						this.countPrefs = pluginPrefs.get().count;
					});
				},
				methods: {
					incCountState: async function() {
						this.isSaving = true;
						await pluginState.set({ count: this.countState + 1 })
						this.isSaving = false;
					},
					incCountPrefs: async function() {
						this.isSaving = true;
						await pluginPrefs.set({ count: this.countPrefs + 1 })
						this.isSaving = false;
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
		if (this.isConnected && this.shadowRoot.childElementCount === 0) {
			const app = createApp({
				template: `
					<link href="/css/plugins.css" rel="stylesheet">
					<div>
						<div>In Periode <em>{{periodLabel}}</em></div>
						<button @click="incCount" :disabled="isSaving" class="button--primary">count in state: {{ count }}</button>
					</div>
				`,
				data: () => ({
					periodId: this.getAttribute('period-id'),
					periodLabel: '',
					isSaving: false,
					count: (pluginState.get() || {}).count || 0
				}),
				mounted: function() {
					pluginState.watch(() => {
						this.count = pluginState.get().count;
					});
				},
				methods: {
					incCount: async function() {
						this.isSaving = true;
						await pluginState.set({ count: this.count + 1 })
						this.isSaving = false;
					}
				},
				watch: {
					periodId: {
						async handler() {
							if (this.periodId.length > 0 && this.periodId !== '0') {
								const period = await weblingInstances.period.load(parseInt(this.periodId));
								this.periodLabel = period.label;
							} else {
								this.periodLabel = '';
							}
						},
						immediate: true
					}
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

class PluginTestMemberDialogSidebar extends HTMLElement {
	static get observedAttributes() { return ['member-id']; }

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this.isConnected && this.shadowRoot.childElementCount === 0) {
			const app = createApp({
				template: `
					<link href="/css/plugins.css" rel="stylesheet">
					<div>Ausgewältes Mitglied <em>{{memberLabel}}</em></div>
				`,
				data: () => ({
					memberId: this.getAttribute('member-id'),
					memberLabel: '',
				}),
				watch: {
					memberId: {
						async handler() {
							if (this.memberId.length > 0 && this.memberId !== '0') {
								const member = await weblingInstances.member.load(parseInt(this.memberId));
								this.memberLabel = member.label;
							} else {
								this.memberLabel = '';
							}
						},
						immediate: true
					}
				}
			}).mount(this.shadowRoot);
			this.setMemberId = memberId => {
				app.memberId = memberId;
			}
		}
	}

	async attributeChangedCallback() {
		if (typeof this.setMemberId === 'function') {
			this.setMemberId(this.getAttribute('member-id'))
		}
	}
}

class PluginTestMemberGridMenu extends HTMLElement {
	static get observedAttributes() { return ['member-ids', 'membergroup-id']; }

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this.isConnected && this.shadowRoot.childElementCount === 0) {
			const app = createApp({
				template: `
					<link href="/css/plugins.css" rel="stylesheet">
					<div>
						<div>Ausgewälte Mitglieder <em>{{memberIds}}</em></div>
						<div>In Mitgliedergruppe <em>{{membergroupLabel}}</em></div>
						<div>
							<button @click="closeDialog" class="button">Schliessen</button>
						</div>
					</div>
				`,
				data: () => ({
					memberIds: this.getAttribute('member-ids'),
					membergroupId: this.getAttribute('membergroup-id'),
					membergroupLabel: '',
				}),
				watch: {
					membergroupId: {
						async handler() {
							if (this.membergroupId.length > 0 && this.membergroupId !== '0') {
								const membergroup = await weblingInstances.membergroup.load(parseInt(this.membergroupId));
								this.membergroupLabel = membergroup.label;
							} else {
								this.membergroupLabel = '';
							}
						},
						immediate: true
					}
				},
				methods: {
					closeDialog: () => {
						this.shadowRoot.dispatchEvent(new CustomEvent('close-dialog', { bubbles: true, composed: true }));
					}
				}
			}).mount(this.shadowRoot);
			this.setMemberIds = memberIds => {
				app.memberIds = memberIds;
			}
			this.setMembergroupId = membergroupId => {
				app.membergroupId = membergroupId;
			}
		}
	}

	async attributeChangedCallback() {
		if (typeof this.setMemberIds === 'function') {
			this.setMemberIds(this.getAttribute('member-ids'))
		}
		if (typeof this.setMembergroupId === 'function') {
			this.setMembergroupId(this.getAttribute('membergroup-id'))
		}
	}
}

export default {
	name: 'com.webling.plugin.test',
	apiversion: 2,
	pluginversion: '1.0.0',
	hooks: [{
		hook: 'plugin-config',
		element: PluginTestConfig,
		dialogTitle: 'Mitglieder auf einer Karte anzeigen Plugin',
	}, {
		hook: 'member-panel-navigation',
		label: () => 'Test Plugin',
		element: PluginTestNavigation
	}, {
		hook: 'accounting-panel-navigation',
		label: 'Test Plugin',
		element: PluginTestAccountingNavigation
	}, {
		hook: 'document-panel-navigation',
		label: () => 'Test Plugin',
		element: PluginTestNavigation
	}, {
		hook: 'member-dialog-sidebar',
		element: PluginTestMemberDialogSidebar
	}, {
		hook: 'member-grid-menu',
		label: 'Test Plugin',
		element: PluginTestMemberGridMenu,
		dialogTitle: 'Test Plugin Dialog',
		dialogWidth: 500
	}],
	async onLoad(context) {
		weblingInstances = context.instances;
		pluginConfig = context.config;
		pluginState = context.state;
		pluginPrefs = context.prefs;
	}
}
