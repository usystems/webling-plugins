class HelloWorld extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = '<div>Hello World</div>';
    }
}

export default {
    name: 'com.webling.plugin.hello-world',
    apiversion: 2,
    pluginversion: '1.0.0',
    hooks: [{
        hook: 'member-panel-navigation',
        label: 'Hello World',
        element: HelloWorld
    }]
}
