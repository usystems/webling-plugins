let instances;

class PluginMemberLastmodified extends HTMLElement {

	static get observedAttributes() { return ['member-id']; }

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
			<link href="/css/plugins.css" rel="stylesheet">
			<h2>Zuletzt geändert</h2> 
			<div class="time"></div>
		`;
	}

	async connectedCallback() {
		await updateElement(this);
	}

	async attributeChangedCallback() {
		await updateElement(this);
	}
}

async function updateElement(el) {
	let memberId = el.getAttribute('member-id');
	if (/^[1-9]\d*$/.test(memberId)) {
		let member = await instances.member.load(parseInt(memberId, 10));
		let lastmodified = member.meta.lastmodified;
		if (lastmodified instanceof Date) {
			el.shadowRoot.querySelector('.time').textContent = lastmodified.toLocaleDateString(
				'de-ch',
				{ year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }
			);
		}
	}
}

export default {
	name: 'com.webling.plugin.member-lastmodified',
	apiversion: 1,
	pluginversion: '1.0.0',
	hooks: [{
		hook: 'member-dialog-sidebar',
		tagName: 'plugin-member-lastmodified'
	}],
	async onLoad(context) {
		instances = context.instances;
		customElements.define('plugin-member-lastmodified', PluginMemberLastmodified);
	}
}
