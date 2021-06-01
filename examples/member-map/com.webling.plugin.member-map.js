import { createApp } from 'https://unpkg.com/vue@^3.0.11/dist/vue.esm-browser.js';
import { Loader } from 'https://unpkg.com/@googlemaps/js-api-loader@^1.11.4/dist/index.esm.js'

let weblingAPI;
let config;

class PluginMemberMap extends HTMLElement {
	constructor() {
		super();

		/**
		 * Create a shadow dom root. The root is saved in this.shadowRoot
		 */
		this.attachShadow({ mode: 'open' });

		this.isInitialized = false;
	}

	async connectedCallback() {
		if (this.isConnected && !this.isInitialized) {
			this.isInitialized = true;
			
			this.shadowRoot.innerHTML = `
				<link href="/css/plugins.css" rel="stylesheet">
				<style>.map-el { width: 100%; height: calc( 100vh - 80px ) }</style>
				<h1>Karte</h1>
				<div class="map-el">Google Maps Laden ...</div>
			`;

			const instances = await weblingAPI.member.list();

			const loader = new Loader({ apiKey: config.get().googleMapsKey });
			await loader.load();

			const map = new google.maps.Map(this.shadowRoot.querySelector('.map-el'));
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
	}
}

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
				<div>
					Google Maps API Key: <input v-model="key"><br>
					<button @click="save" class="button--primary">Speichern</button>
				</div>`,
				data: () => ({
					key: config.get().googleMapsKey || ''
				}),
				methods: {
					async save() {
						await config.set({ googleMapsKey: this.key });
					}
				}
			}).mount(this.shadowRoot);
		}
	}
}

export default {
	name: 'com.webling.plugin.member-map',
	apiversion: 1,
	pluginversion: '1.0.0',
	hooks: [{
		hook: 'plugin-config',
		tagName: 'plugin-member-map-config'
	}, {
		hook: 'member-panel',
		label: 'Mitglieder auf Karte',
		tagName: 'plugin-member-map'
	}],
	async onLoad(context) {
		weblingAPI = context.weblingAPI;
		config = context.config;
		customElements.define('plugin-member-map', PluginMemberMap);
		customElements.define('plugin-member-map-config', PluginMemberMapConfig);
	}
}
