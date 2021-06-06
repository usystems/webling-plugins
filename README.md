# Webling Plugins

[Webling](https://www.webling.ch) is a managment software for clubs and associations. It is extensible by plugins. This repo 
contains all ressources around the development of webling plugins.

The Webling plugin system is not publically available yet. If you are insterested in writing a plugin, write to 
[support@webling.ch](email://support@webling.ch)

## How do Webling Plugins work

Webling provides many extention points called [hooks](#extention-points) for extention. On a high level description, a 
plugin is a microfrontend which is inserted into Webling by a custom elements. A Plugin is represented by a ES Module which
is dynamically imported at runtime. For each extention point, the can plugin provides a custom element which displays the
content of the plugin. Webling provides a rich api to access the underlying datastructurs.

Since a Webling plugin is a microfrontend using native custom element as root elements, Webling plugins are framework
agnostic. A Webling plugin can be build in your favorite frontend framework: plain JavaScript, React, VueJs, Angular, 
Svelte or whatever you like. 

## How is a Webling Plugin structured

Every programming tutorial must have a hello world example, lets look look at the hello world Webling plugin:
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
A Weblig plugin consists of two parst

### The plugin configuration

The plugin must be a valid ES Module. The plugin configuration is exported as the default export. It must contain the 
following keys:

- `name`: String

    Every plugin must must have aname. We recommend using the [Reverse Domain Name Notaion](https://en.wikipedia.org/wiki/Reverse_domain_name_notation)
    to make clear there the plugin comes from.

- `apiversion`: Number

    A plugin must specify which which Version of the Plugin it is compatible with. Currently only the number `1` is a
    valid value.
    
- `pluginversion`: String

    We recommend to version a Webling plugin using [Sematic Versiong](https://semver.org).
    
- `hooks`: Array

    In the hooks array it is specified how the plugin shoud extend Webling. In the example above, the tag `plugin-hello-wolrd`
    is inserted in the member panel. In the navigation the label `Hello World is displaied. Every hook has different 
    options. The hooks are described in [Extention Points](#extention-points)

- `onLoad`: Function

    After Webling is loaded, all plugins are dynamically imported and the `onLoad` of each plugin is called. The on load
    function gets the plugin context as an argument. The context is described in [Starting a Plugin](#starting-a-plugin).
    The on load callback should register all custom elements provided in the hooks.

### The custom elements 

Plugins can extend webling by registring native [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). 
All custom elements provided by a plugin must start with `plugin-` to be recognised as native custom elements. To avoid 
naming conflicts the custom elements of a plugin should contain the plugin.

## Extention Points

Webling provides the following hooks for extension

### `plugin-config`

This Hook allows the plugin to provide a Configuration panel. An example on how a configuration panel can look like, 
look in the [member map example plugin](./examples/member-map#readme)

#### Options

- `hook`: the name of the hook, here 'plugin-config'.
- `tagName`: the name of the custom elements representing the configuration interface

### `member-panel`

If you want to extend the member panel with a whole new function, this hook gives you the possibility to add a navigation
item in the member panel.

#### Options

- `hook`: the name of the hook, here 'member-panel'.
- `label`: the label of the menu item, which is shown in the member navigation. 
- `tagName`: the name of the custom elements representing the new function.
		
## Starting a Plugin

After a Webling plugin is imported, the `onLoad` callback is called. Webling provides the plugin context as the first argument.
The context contains the following apis:

### `context.weblingAPI`

### `context.http`

### `context.config`

### `context.state`

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

make sure you add the `--cors` command line argument to allow cross origin imports. Now you can add your plugin to 
your Webling with `http://localhost:3000/index.js` (if your main plugin file is not called `index.js`, use the correct
filename).

## Example Plugins

### Member Map

An example plugins which shows how to visualize all members on a google map directly in webling itself. The plugin is 
described more in deep in the [plugin readme](./examples/member-map#readme)
