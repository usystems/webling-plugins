# Webling Plugins

[Webling](https://www.webling.ch) is a software for associations that perfectly matches individual requirements. Whether 
it is a sports club, umbrella organization or a non-profit association, the software adapts easily to their needs.

Webling is extensible by plugins. This repo contains all resources around the development of Webling plugins.

The Webling plugin system is not publically available yet. If you are interested in writing a plugin, contact us at 
[support@webling.ch](mailto:support@webling.ch?subject=[GitHub]%20Plugin%20Access)

## How does a Webling plugin work

Webling provides many extension points called [hooks](#hooks-extension-points) for extension. On a high level description, a 
plugin is a micro frontend which is inserted into Webling by adding custom elements. A plugin is an ES Module which
is dynamically imported at runtime. For each extension point, the plugin can provide a custom element which displays
content provided by the plugin. Webling provides an API to access the underlying data structure.

Since a Webling plugin is a micro frontend using native custom element as root elements, Webling plugins are framework
agnostic. A Webling plugin can be build using your favorite frontend framework: plain JavaScript, React, VueJs, Angular, 
Svelte or whatever you like. 

## How is a Webling plugin structured

Every programming tutorial must have a hello world example. Lets look at the hello world Webling plugin:

```Javascript
class PluginHelloWorld extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = '<div>Hello World</div>';
	}
}

export default {
	name: 'com.webling.plugin.hello-world',
	apiversion: 1,
	pluginversion: '1.0.0',
	hooks: [{
		hook: 'member-panel',
		label: 'Hello World',
		tagName: 'plugin-hello-world'
	}],
	onLoad(context) {
		customElements.define('plugin-hello-world', PluginHelloWorld);
	}
}
```

A Weblig plugin consists of two parts: the _configuration_ and the _custom elements_:

### The Plugin configuration

The plugin must be a valid ES Module. The plugin configuration is exported as the default export and must implement the 
[`IWeblingPlugin`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPlugin.ts#L87) interface. It must 
contain the following keys:

- `name`: String

    Every plugin must have a unique name. We recommend using the [Reverse Domain Name Notaion](https://en.wikipedia.org/wiki/Reverse_domain_name_notation)
    to make clear where the plugin comes from.

- `apiversion`: Number

    A plugin must specify with which version of the API it is compatible. Currently, only the version `1` is supported.
    
- `pluginversion`: String

    We recommend versioning the plugin using [Semantic Versioning](https://semver.org).
    
- `hooks`: Array

    The hooks array specifies how the plugin extends Webling. In the example above, the tag `plugin-hello-world`
    is inserted into the member panel. In the navigation a new menu item with the label `Hello World` is displayed. 
    Every hook has different options. The hooks are described in [extension points](#hooks-extension-points)

- `onLoad`: Function

    After Webling is loaded, all plugins are dynamically imported and the `onLoad` of each plugin is called. The `onLoad`
    function gets the plugin context as an argument. The context is described in [Starting a Plugin](#the-plugin-context).
    
    The `onLoad` callback should register all custom elements provided in the hooks.
    
    The `onLoad` function can return a Promise if it needs to execute asynchronous actions.

### The Custom Elements 

Plugins can extend webling by registering native [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). 
All custom elements provided by a plugin must start with `plugin-` to be recognised as native custom elements. To avoid 
naming conflicts the custom elements of a plugin should be unique and contain the plugin name.

## Hooks (Extension Points)

To provide Webling with the necessary information to load the plugin, every extension point has a configuration with the name of the 
extension point (called hook) and all needed context information. 

Some extension points provide event listeners. For example, the `plugin-config` hook provides an event listener to 
close the configuration dialog. These listeners are called using native events:

```javascript
this.shadowRoot.dispatchEvent(new CustomEvent('close-dialog', { bubbles: true, composed: true }));
```

Webling provides the following hooks for extension:

### `plugin-config`

This hook allows the plugin to provide a configuration dialog. An example of a configuration dialog can be found here:
[member map example plugin](./examples/member-map#readme)

#### Options

```Javascript
{
  hook: 'plugin-config', // the name of the hook, here 'plugin-config'.
  tagName: 'plugin-my-plugin-configuration' // the name of the custom element representing the configuration interface
}
```

#### Events

- `close-dialog`: close the config dialog

### `member-panel-navigation`

If you want to extend the member panel with a new page, this hook gives you the possibility to add a navigation
item to the member panel.

#### Options

```Javascript
{
  hook: 'member-panel', // the name of the hook, here 'member-panel'.
  label: 'My Plugin Page', // the label of the menu item, which is shown in the member navigation. 
  tagName: 'plugin-my-custom-element' // the name of the custom element representing the new page.
}
```

### `member-grid-menu`

### `accounting-panel-navigation`

### `document-panel-navigation`

## The Plugin Context

After a Webling plugin is imported, the `onLoad` callback is called. Webling provides the plugin context as the only argument.
The context implements the [`IWeblingPluginContext`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPlugin.ts#L79)
interface and contains the following apis:

### `context.instances`
[`IWeblingPluginInstances`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPlugin.ts#L20)

### `context.http`
[`IWeblingPluginHttp`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPlugin.ts#L62)

	- `get(url: string): Promise`
	- `post(url: string, data?: any): Promise`
	- `put(url: string, data?: any): Promise`
	- `delete(url: string): Promise`

### `context.config`

`context.config` implements [`IWeblingPluginConfig`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPlugin.ts#L69)
and provides an interface to the plugin configuration. If the plugin needs specific data like API keys for
Google Maps, or some formatting options, you should store these in the configuration object. The configuration
must be serializable. The plugin configuration should be managed in an interface which is displayed in the `plugin-config` 
hook.

The plugin configuration is only writable by the administrator of the Webling, but readable for every user.

The configuration object has the following structure:

  - `get(): Object`: `context.config.get()` returns the current configuration of the plugin
  - `set(config: Object): Promise`: updates the plugin configuration. The returned promise resolves if the 
  configuration was saved successfully.

### `context.state`

`context.state`  implements [`IWeblingPluginState`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPlugin.ts#L74)
and provides an interface to the plugin state. The state can be any serializable object. In contrast to the
configuration it can be read and written by all users.

The state object has the following structure:

  - `get(): any`: `context.state.get()` returns the current state of the plugin.
  - `set(state: any): Promise`: updates the plugin state. The returned promise resolves if the state was 
  saved successfully.

### `context.language`

The language, the Webling user is using. The following languages are possible:

- `de`(German) This is the default language of the vast majority of users.
- `en`(English)
- `fr`(French)

## Plugin Development

For plugin development, you need a local server to provide your plugin since browsers do not allow the import of local 
files out of security reasons. We propose [`browser-sync`](https://browsersync.io/) to develop your local plugin.

Now you can install and start `browser-sync` as a  local dev server using

`npx browser-sync start --server --cors`

make sure you add the `--cors` command line argument to allow cross-origin imports. Now you can add your plugin to 
your Webling with the url `http://localhost:3000/index.js` (if your main plugin file is not called `index.js`, use the correct
filename).

### Typescript

If you write a plugin in typescript you can install the webling typings with

`npm install webling-plugin-typings`


## Plugin Hosting

Since a Plugin must be publicly available, we recommend hosting Webling plugins on GitHub. Since GitHub is not a content
delivery network, you need a cdn to deliver your plugin with the correct headers. You can use [raw.githack.com](https://raw.githack.com/).
A more detailed explanation on how to deliver your plugin correctly look at this [medium post](https://lukasgamper.medium.com/how-to-import-files-directly-from-github-1a41c72a3ad3).

## Example Plugins

### [Member Map](./examples/member-map#readme)

An example plugins which shows how to visualize all members on a Google map directly in webling itself.
