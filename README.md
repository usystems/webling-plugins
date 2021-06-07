# Webling Plugins

[Webling](https://www.webling.ch) is a software for associations that perfectly matches individual requirements. Whether 
it is a sports club, umbrella organization or a non-profit association, the software adapts easily to their needs.

Webling is extensible by plugins. This repo contains all ressources around the development of webling plugins.

The Webling plugin system is not publically available yet. If you are insterested in writing a plugin, write to 
[support@webling.ch](mailto:support@webling.ch?subject=[GitHub]%20Plugin%20Access)

## How does a Webling Plugin work

Webling provides many extention points called [hooks](#extension-points) for extention. On a high level description, a 
plugin is a microfrontend which is inserted into Webling by a custom elements. A Plugin is represented by an ES Module which
is dynamically imported at runtime. For each extension point, the plugin can provides a custom element which displays
content provided by the plugin. Webling provides a rich api to access the underlying datastructurs.

Since a Webling plugin is a microfrontend using native custom element as root elements, Webling plugins are framework
agnostic. A Webling plugin can be build using your favorite frontend framework: plain JavaScript, React, VueJs, Angular, 
Svelte or whatever you like. 

## How is a Webling Plugin structured

Every programming tutorial must have a hello world example, lets look at the hello world Webling plugin:
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
		tagName: 'plugin-hello-wolrd'
	}],
	onLoad(context) {
		customElements.define('plugin-hello-wolrd', PluginHelloWorld);
	}
}
```
A Weblig plugin consists of two parts

### The Plugin Configuration

The plugin must be a valid ES Module. The plugin configuration is exported as the default export. It must contain the 
following keys:

- `name`: String

    Every plugin must have a name. We recommend using the [Reverse Domain Name Notaion](https://en.wikipedia.org/wiki/Reverse_domain_name_notation)
    to make clear there the plugin comes from.

- `apiversion`: Number

    A plugin must specify which Version of the Plugin it is compatible with. Currently, only the number `1` is a
    valid value.
    
- `pluginversion`: String

    We recommend versioning a Webling plugin using [Sematic Versioning](https://semver.org).
    
- `hooks`: Array

    In the hooks array it is specified how the plugin should extend Webling. In the example above, the tag `plugin-hello-wolrd`
    is inserted in the member panel. In the navigation the label `Hello World is displayed. Every hook has different 
    options. The hooks are described in [extension Points](#extension-points)

- `onLoad`: Function

    After Webling is loaded, all plugins are dynamically imported and the `onLoad` of each plugin is called. The `onLoad`
    function gets the plugin context as an argument. The context is described in [Starting a Plugin](#the-plugin-context).
    
    The on load callback should register all custom elements provided in the hooks.
    
    The `onLoad` function can return a Promise if it needs to execute asynchronous actions.

### The Custom Elements 

Plugins can extend webling by registering native [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). 
All custom elements provided by a plugin must start with `plugin-` to be recognised as native custom elements. To avoid 
naming conflicts the custom elements of a plugin should contain the plugin name.

## Extension Points

To provide Webling with the necessary information, every extension point has a configuration where the name of the 
extension point (called hook) and all needed context information are provided. 

Some extension points provide some event listeners. For example, the `plugin-config` hook provides an event listener to 
close the configuration dialog. These listeners are called using native events:

```javascript
this.shadowRoot.dispatchEvent(new CustomEvent('close-dialog', { bubbles: true, composed: true }));
```

Webling provides the following hooks for extension:

### `plugin-config`

This Hook allows the plugin to provide a Configuration panel. An example on how a configuration panel can look like, 
look in the [member map example plugin](./examples/member-map#readme)

#### Options

- `hook`: the name of the hook, here 'plugin-config'.
- `tagName`: the name of the custom elements representing the configuration interface

#### Events

- `close-dialog`: close the config dialog

### `member-panel`

If you want to extend the member panel with a whole new function, this hook gives you the possibility to add a navigation
item in the member panel.

#### Options

- `hook`: the name of the hook, here 'member-panel'.
- `label`: the label of the menu item, which is shown in the member navigation. 
- `tagName`: the name of the custom elements representing the new function.
		
## The Plugin Context

After a Webling plugin is imported, the `onLoad` callback is called. Webling provides the plugin context as the first argument.
The context contains the following apis:

### `context.weblingAPI`

### `context.http`

	- `get(url: string): Promise`
	- `post(url: string, data?: any): Promise`
	- `put(url: string, data?: any): Promise`
	- `delete(url: string): Promise`

### `context.config`

`context.confit` provides an interface to the plugin configuration. If the plugin needs specific data like API keys for
Google Maps, or some formatting options, you should store these informations in the configuration object. The configuration
must be serializable The plugin configuration should be managed in an interface which is displayed in the `plugin-config` 
hook.

The plugin configuration is only writable by the administrator of the Webling store, but readable fore every user.

The configuration object has the following structure:

  - `get(): Object`: `context.config.get()` returns the configuration of a=the plugin. It returns the object which has last
  been written by `context.config.get(config)`.
  - `set(config: Object): Promise`: writes a new configuration to the plugin. The returned promise resolves if the 
  configuration was saved successfully.

### `context.state`

`context.state` provides an interface to the plugin state. The state can be any serializable object. In contrast to the
coinfiguration it can be read and written by all users.

The state object has the following structure:

  - `get(): any`: `context.state.get()` returns the thest of the plugin. It returns the object which has last
  been written by `context.state.get(state)`.
  - `set(state: any): Promise`: writes a new state to the plugin. The returned promise resolves if the state was 
  saved successfully.

### `context.language`

The language, the Webling user is using. The following languages are possible:

- `de`(German) This is the default language the vast majority of users are using.
- `en`(English)
- `fr`(French)

## Plugin Development

For plugin development, you need a local server to provide your plugin since browsers do not allow the import of local 
files out of security reasons. We propose [`browser-sync`](https://browsersync.io/) to develop your local plugin.

If you start from scratch, first initialize npm using

`npm init`

and install `browser-sync` with

`npm install --save-dev browser-sync`

Now you can start your local dev server using

`npx browser-sync start --server --cors`

make sure you add the `--cors` command line argument to allow cross-origin imports. Now you can add your plugin to 
your Webling with `http://localhost:3000/index.js` (if your main plugin file is not called `index.js`, use the correct
filename).

## Plugin Hosting

Since a Plugin must be publicly available, we recommend hosting Webling plugins on GitHub. Since GitHub does not like
if you use github raw files in production, there are many services providing a CDN for github files. For example
[raw.githack.com](https://raw.githack.com/) serves your files from CloudFlare's CDN.

## Example Plugins

### [Member Map](./examples/member-map#readme)

An example plugins which shows how to visualize all members on a Google map directly in webling itself.
