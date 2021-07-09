import { createApp } from 'https://unpkg.com/vue@3.1.1/dist/vue.esm-browser.js';

/** @type {IWeblingPluginContext} */
let weblingContext;

class PluginGoogleCalendarPage extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}
	connectedCallback() {
		if (this.isConnected) {

			// create the Vue app
			createApp({
				template: `<link href="/css/plugins.css" rel="stylesheet">
				<h1>Kalender</h1>
				<div class="content-container">
					<div v-if="calendarUrl">
						<iframe :src="calendarUrl" style="border: 0" width="100%" height="600" frameborder="0" scrolling="no"></iframe>
					</div>
					<div v-else>
						Keine Kalender URL konfiguriert
					</div>
				</div>`,
				computed: {
					calendarUrl: function () {
						let baseurl = weblingContext.config.get().calendarUrl;
						if (!baseurl) {
							return null;
						}
						baseurl += '&showNav=' + (weblingContext.config.get().showNav || 1)
						baseurl += '&showTabs=' + (weblingContext.config.get().showTabs || 1)
						baseurl += '&showPrint=' + (weblingContext.config.get().showPrint || 0)
						baseurl += '&showTitle=' + (weblingContext.config.get().showTitle || 0)
						baseurl += '&showCalendars=' + (weblingContext.config.get().showCalendars || 0)
						baseurl += '&showTz=' + (weblingContext.config.get().showTz || 0)
						baseurl += '&mode=' + (weblingContext.config.get().mode || 'MONTH')
						return baseurl;
					}
				}
			}).mount(this.shadowRoot);
		}
	}
}

class PluginGoogleCalendarConfig extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		if (this.isConnected) {
			createApp({
				template: `<link href="/css/plugins.css" rel="stylesheet">
				<div>
					<h2>Google Kalender URL</h2> 
					<div>
						<input style="width: 100%" v-model="calendarUrl" @blur="onUrlBlur()" placeholder="https://calendar.google.com/calendar/embed?src=kalender-id">
						<div v-if="calendarUrl">
							<div v-if="isValidUrl" class="text-success">Kalender URL ist gültig.</div>
							<div v-else class="text-danger">Kalender URL ist ungültig.</div>
						</div>
					</div>
					<h2>Standardansicht</h2>
					<div>
						<select v-model="mode">
							<option value="WEEK">Woche</option>
							<option value="MONTH">Monat</option>
							<option value="AGENDA">Terminübersicht</option>
						</select>
					</div>
					<h2>Darstellungsoptionen</h2>
					<div>
						<label>
							<input type="checkbox" v-model="showNav" true-value="1" false-value="0"> Navigationsschaltflächen
						</label>
					</div>
					<div>
						<label>
							<input type="checkbox" v-model="showTabs" true-value="1" false-value="0"> Tabs
						</label>
					</div>
					<div>
						<label>
							<input type="checkbox" v-model="showPrint" true-value="1" false-value="0"> Druckersymbol
						</label>
					</div>
					<div>
						<label>
							<input type="checkbox" v-model="showTitle" true-value="1" false-value="0"> Titel
						</label>
					</div>
					<div>
						<label>
							<input type="checkbox" v-model="showCalendars" true-value="1" false-value="0"> Kalenderliste
						</label>
					</div>
					<div>
						<label>
							<input type="checkbox" v-model="showTz" true-value="1" false-value="0"> Zeitzone
						</label>
					</div>
					<br>
					<div>
						<button @click="save" class="button--primary">Speichern</button>
						<button @click="close" class="button">Schliessen</button>
					</div>
				</div>`,
				data: () => ({
					calendarUrl: weblingContext.config.get().calendarUrl || '',
					showNav: weblingContext.config.get().showNav || 1,
					showTabs: weblingContext.config.get().showTabs || 1,
					showPrint: weblingContext.config.get().showPrint || 0,
					showTitle: weblingContext.config.get().showTitle || 0,
					showCalendars: weblingContext.config.get().showCalendars || 0,
					showTz: weblingContext.config.get().showTz || 0,
					mode: weblingContext.config.get().mode || 'MONTH',
				}),
				methods: {
					save() {
						weblingContext.config.set({
							calendarUrl: this.calendarUrl,
							showNav: this.showNav,
							showTabs: this.showTabs,
							showPrint: this.showPrint,
							showTitle: this.showTitle,
							showCalendars: this.showCalendars,
							showTz: this.showTz,
							mode: this.mode
						});
						this.close();
					},
					close: () => {
						this.shadowRoot.dispatchEvent(new CustomEvent('close-dialog', { bubbles: true, composed: true }));
					},
					onUrlBlur() {
						let regexp = /^(<iframe src=")?(https:\/\/calendar\.google\.com\/calendar\/embed[^"\s]*).*$/i;
						let matches_array = this.calendarUrl.match(regexp);
						if (matches_array && matches_array.length === 3) {
							let newUrl = matches_array[2];
							newUrl = newUrl.replaceAll('&amp;','&');
							newUrl = newUrl.replaceAll('&showTitle=0','');
							newUrl = newUrl.replaceAll('&showTitle=1','');
							newUrl = newUrl.replaceAll('&showPrint=0','');
							newUrl = newUrl.replaceAll('&showPrint=1','');
							newUrl = newUrl.replaceAll('&showTz=0','');
							newUrl = newUrl.replaceAll('&showTz=1','');
							newUrl = newUrl.replaceAll('&showCalendars=0','');
							newUrl = newUrl.replaceAll('&showCalendars=1','');
							newUrl = newUrl.replaceAll('&showNav=0','');
							newUrl = newUrl.replaceAll('&showNav=1','');
							newUrl = newUrl.replaceAll('&showDate=0','');
							newUrl = newUrl.replaceAll('&showDate=1','');
							newUrl = newUrl.replaceAll('&showTabs=0','');
							newUrl = newUrl.replaceAll('&showTabs=1','');
							newUrl = newUrl.replaceAll('&mode=MONTH','');
							newUrl = newUrl.replaceAll('&mode=WEEK','');
							newUrl = newUrl.replaceAll('&mode=AGENDA','');
							if (this.calendarUrl !== newUrl) {
								this.calendarUrl = newUrl;
							}
						}
					}
				},
				computed: {
					isValidUrl() {
						if (this.calendarUrl) {
							let regexp = /^(https:\/\/calendar\.google\.com\/calendar\/embed[^"\s]*)$/i;
							let matches_array = this.calendarUrl.match(regexp);
							console.log(matches_array);
							return matches_array !== null;
						}
						return false;
					}
				}
			}).mount(this.shadowRoot);
		}
	}
}

export default {
	name: 'com.webling.plugin.google-calendar',
	apiversion: 2,
	pluginversion: '1.0.0',
	hooks: [{
		hook: 'plugin-config',
		tagName: 'plugin-google-calendar-config',
		dialogTitle: 'Kalender konfigurieren',
	}, {
		hook: 'member-panel-navigation',
		label: 'Kalender',
		tagName: 'plugin-google-calendar-page'
	}],
	/**
	 * @param {IWeblingPluginContext} context
	 */
	async onLoad(context) {
		weblingContext = context;
		customElements.define('plugin-google-calendar-page', PluginGoogleCalendarPage);
		customElements.define('plugin-google-calendar-config', PluginGoogleCalendarConfig);
	}
}
