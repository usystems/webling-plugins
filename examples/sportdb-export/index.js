import { createApp } from 'https://unpkg.com/vue@3.1.1/dist/vue.esm-browser.js';

/*
J+S SPORTdb format specifications:
https://www.jugendundsport.ch/content/jus-internet/de/infos-fuer/j-s-coaches/sportdb--hinweise-hilfe-/angebot-anmelden/_jcr_content/contentPar/accordion_copy/accordionItems/merkbl_tter_zum_teil/accordionPar/downloadlist/downloadItems/47_1456398355913.download/3_Anforderungen_SPORTdb_d.pdf

POS NAME            LÄNGE   PFLICHT BEISPIEL
1   NDBJS_PERS_NR   9       nein    123456789
2   GESCHLECHT      1       ja      1 (männlich), 2 (weiblich)
3   NAME            30      ja      Muster
4   VORNAME         20      ja      Franz
5   GEB_DATUM       10      ja      09.05.1992 (gültiges Datum in Vergangenheit)
6   AHV_NR          13      nein    756.xxxx.xxxx.xx (Die Prüfziffer muss stimmen.)
7   STRASSE         30      nein    Alpenweg 13
8   PLZ             5       ja      3000
9   ORT             35      ja      Bern
10  LAND            3       ja      CH, FL, D, F, I, A oder DIV (diverse)
11  NATIONALITAET   3       ja      CH, FL, DIV (diverse)
12  ERSTSPRACHE     1       ja      D, F, I, E
13  KLASSE/GRUPPE   25      nein    Klasse 3c oder Jugendriege
 */

/** @type {IWeblingPluginContext} */
let weblingContext;

class SportdbExportDialog extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}
	connectedCallback() {
		if (this.isConnected) {

			// get member ids from the current member grid and sanitize ids
			let memberIds = this.getAttribute('member-ids');
			if (memberIds) {
				memberIds = memberIds.split(',')
					.map((id) => parseInt(id))
					.filter((id) => !isNaN(id) && id !== 0);
			} else {
				memberIds = [];
			}

			// create the Vue app
			createApp({
				template: `<link href="/css/plugins.css" rel="stylesheet">
				<div>
					<h2>{{memberIds.length}} Mitglieder exportieren</h2>
					<div class="description">Export der Mitgliederdaten im CSV Format für die J+S SPORTdb.</div>
					<br>
					<a class="button--primary disabled" v-if="loading" disabled>Download wird vorbereitet...</a>
					<a class="button--primary disabled" v-else-if="memberIds.length === 0">Download</a>
					<a @click="closeAfterDownload" :href="'data:text/csv;charset=utf-8,' + fileContents" download="sportdb_export.csv" class="button--primary" v-else>Download</a>
					<button @click="close" class="button">Schliessen</button>
				</div>`,
				mounted: async function() {
					// save memberIds to component data
					this.memberIds = memberIds;

					// load members
					const instances = [];
					const promises = [];
					memberIds.forEach((id) => {
						let promise = weblingContext.instances.member.load(id);
						promise.then((instance) => instances.push(instance));
						promises.push(promise);
					});
					await Promise.all(promises);

					// build and format csv file
					instances.forEach(instance => {
						let fields = [
							'',
							instance.properties.Geschlecht ? (instance.properties.Geschlecht === 'w' ? '2' : '1') : '',
							(instance.properties.Name ? instance.properties.Name : '').substr(0,30),
							(instance.properties.Vorname ? instance.properties.Vorname : '').substr(0,20),
							this.formatDate(instance.properties.Geburtstag ? instance.properties.Geburtstag : ''),
							'',
							(instance.properties.Strasse ? instance.properties.Strasse : '').substr(0,30),
							(instance.properties.PLZ ? instance.properties.PLZ : '').substr(0,5),
							(instance.properties.Ort ? instance.properties.Ort : '').substr(0,35),
							'CH',
							'CH',
							'D',
							''
						];

						// escape values for csv
						let preparedFields = fields.map((field) => {
							field = field.replaceAll('"','""');
							field = encodeURIComponent(field);
							return '"' + field + '"'
						})

						// concat single row into string
						this.rows.push(preparedFields.join(','));
					});
					this.loading = false;
				},
				data: () => {
					return {
						loading: true,
						memberIds: [],
						rows: []
					}
				},
				methods: {
					formatDate: (date) => {
						if (date) {
							return (date.getDate() < 10 ? '0' + date.getDate() : date.getDate()) +
								'.' + ((date.getMonth()+1) < 10 ? '0' + (date.getMonth()+1) : (date.getMonth()+1)) +
								'.' + date.getFullYear();
						}
						return '';
					},
					close: () => {
						this.shadowRoot.dispatchEvent(new CustomEvent('close-dialog', { bubbles: true, composed: true }));
					},
					closeAfterDownload: function() {
						// if we close the dialog immediately, the download does not start
						setTimeout(() => {
							this.close();
						}, 100);
					}
				},
				computed: {
					fileContents: function() {
						// add headers
						let header = "NDBJS_PERS_NR,GESCHLECHT,NAME,VORNAME,GEB_DATUM,AHV_NR,STRASSE,PLZ,ORT,LAND,NATIONALITAET,ERSTSPRACHE,KLASSE/GRUPPE\n";

						// concat all csv rows into a single big string for download
						return (header + this.rows.join("\n"));
					}
				}
			}).mount(this.shadowRoot);
		}
	}
}

export default {
	name: 'com.webling.plugin.sportdb-export',
	apiversion: 2,
	pluginversion: '1.0.0',
	hooks: [{
		hook: 'member-grid-menu',
		label: 'SportDB Export',
		dialogTitle: 'Daten für SportDB exportieren',
		dialogWidth: 500,
		tagName: 'plugin-sportdb-export-dialog'
	}],
	/**
	 * @param {IWeblingPluginContext} context
	 */
	async onLoad(context) {
		weblingContext = context;
		customElements.define('plugin-sportdb-export-dialog', SportdbExportDialog);
	}
}
