import { Loader } from 'https://unpkg.com/@googlemaps/js-api-loader@^1.11.4/dist/index.esm.js'

let weblingAPI;

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

			const mepEl = document.createElement('div');
			mepEl.classList.add('map-el');
			mepEl.textContent = 'Google Maps Laden ...';

			const style = document.createElement('style');
			style.textContent = '.map-el { width: 100%; height: calc( 100vh - 80px ) }';

			this.shadowRoot.append(style, mepEl);

			const instances = await weblingAPI.member.list();

			const loader = new Loader({ apiKey: 'apikey' });
			await loader.load();

			const map = new google.maps.Map(mepEl);
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

export default {
	name: 'com.webling.plugin.member-map',
	apiversion: 1,
	pluginversion: '1.0.0',
	hooks: [{
		hook: 'member-panel',
		label: 'Mitglieder auf Karte',
		tagName: 'plugin-member-map'
	}],
	async install(context) {
		weblingAPI = context.weblingAPI;
		customElements.define('plugin-member-map', PluginMemberMap);
	}
}
