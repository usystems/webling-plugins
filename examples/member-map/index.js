import { createApp } from 'https://unpkg.com/vue@^3.0.11/dist/vue.esm-browser.js';
import { Loader } from 'https://unpkg.com/@googlemaps/js-api-loader@^1.11.4/dist/index.esm.js'

let weblingInstances;
let pluginConfig;

class PluginMemberMapConfig extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.isInitialized = false;
	}

	connectedCallback() {
		if (this.isConnected) {
			createApp({
				template: `<link href="/css/plugins.css" rel="stylesheet">
				<div style="padding-top: 20px">
					<div>Google Maps API Key</div> 
					<div><input style="width: 420px" v-model="key" placeholder="Google Maps API Key"></div>
					<div style="position: absolute; bottom: 20px">
						<button @click="save" class="button--primary">Speichern</button>
						<button @click="close" class="button">Schliessen</button>
					</div>
				</div>`,
				data: () => ({
					key: pluginConfig.get().googleMapsKey || ''
				}),
				methods: {
					async save() {
						await pluginConfig.set({ googleMapsKey: this.key });
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

class PluginMemberMapPanel extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<link href="/css/plugins.css" rel="stylesheet">
			<style>.map-el { width: 100%; height: calc( 100vh - 80px ) }</style>
			<h1>Karte</h1>
			<div class="map-el">Google Maps Laden ...</div>
		`;
	}

	async connectedCallback() {
		if (this.isConnected) {
			const instances = await weblingInstances.member.list();
			await showGoogleMaps(this.shadowRoot, instances);
		}
	}
}

class PluginMemberMapGrid extends HTMLElement {
	static get observedAttributes() { return ['member-ids']; }

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<link href="/css/plugins.css" rel="stylesheet">
			<style>.map-el { width: 100%; height: calc( 100vh - 180px ) }</style>
			<div class="map-el">Google Maps Laden ...</div>
		`;
	}

	async attributeChangedCallback() {
		const memberIds = this.getAttribute('member-ids')
			.split(',')
			.map(strId => parseInt(strId, 10))
			.filter(id => !isNaN(id) && id !== 0)
		;
		const instances = await Promise.all(memberIds.map(memberId => weblingInstances.member.load(memberId)));
		await showGoogleMaps(this.shadowRoot, instances);
	}
}

async function showGoogleMaps(shadowRoot, instances) {
	const loader = new Loader({ apiKey: pluginConfig.get().googleMapsKey });
	await loader.load();

	const map = new google.maps.Map(shadowRoot.querySelector('.map-el'));
	const bounds = new google.maps.LatLngBounds();
	const info = new google.maps.InfoWindow();

	const memberDialogBaseURI = `${window.location.href}${window.location.href.includes('#') ? '' : '#'}/:member/view/`;

	instances
		.filter(instance => typeof instance.meta.lat === 'number' && typeof instance.meta.lng === 'number')
		.forEach(instance => {
			const marker = new google.maps.Marker({
				position: new google.maps.LatLng(instance.meta.lat, instance.meta.lng),
				map: map
			});
			bounds.extend(marker.position);
			google.maps.event.addListener(marker, 'click', () => {
				info.setContent(`<a href="${memberDialogBaseURI}${instance.id}">${instance.label}</a>`);
				info.open(map, marker);
			});
		});

	map.fitBounds(bounds);
}

export default {
	name: 'com.webling.plugin.member-map',
	apiversion: 1,
	pluginversion: '1.0.0',
	hooks: [{
		hook: 'plugin-config',
		tagName: 'plugin-member-map-config',
		dialogTitle: 'Mitglieder auf einer Karte anzeigen Plugin',
	}, {
		hook: 'member-panel',
		label: 'Mitglieder auf Karte',
		tagName: 'plugin-member-map-panel'
	}, {
		hook: 'member-grid-menu',
		label: 'Mitglieder auf Karte',
		dialogTitle: 'Mitglieder auf einer Karte',
		tagName: 'plugin-member-map-grid'
	}],
	async onLoad(context) {
		weblingInstances = context.instances;
		pluginConfig = context.config;
		customElements.define('plugin-member-map-config', PluginMemberMapConfig);
		customElements.define('plugin-member-map-panel', PluginMemberMapPanel);
		customElements.define('plugin-member-map-grid', PluginMemberMapGrid);
	}
}
