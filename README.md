# Webling Plugins

[Webling](https://www.webling.ch) is a software for associations that perfectly matches individual requirements. Whether 
it is a sports club, umbrella organization or a non-profit association, the software adapts easily to their needs.

Webling is extensible by plugins. This repo contains all resources around the development of Webling plugins.

The Webling plugin system is not publicly available yet. If you are interested in writing a plugin, contact us at 
[support@webling.ch](mailto:support@webling.ch?subject=[GitHub]%20Plugin%20Access)

## How does a Webling plugin work

Webling provides many extension points called [hooks](#hooks-extension-points) for extension. On a high level description, a 
plugin is a micro frontend which is inserted into Webling by adding custom elements. A plugin is an ES Module which
is dynamically imported at runtime. For each extension point, the plugin can provide a custom element which displays
content provided by the plugin. Webling provides an API to access the underlying data structure.

Since a Webling plugin is a micro frontend using native custom element as root elements, Webling plugins are framework
agnostic. A Webling plugin can be build using your favorite frontend framework: plain JavaScript, React, VueJs, Angular, 
Svelte or whatever you like. 

## Hello World Example

Every programming tutorial must have a hello world example. Let's look at the hello world Webling plugin:

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
        hook: 'member-panel-navigation',
        label: 'Hello World',
        tagName: 'plugin-hello-world'
    }],
    onLoad(context) {
        customElements.define('plugin-hello-world', PluginHelloWorld);
    }
}
```

A Webling plugin consists of two parts: the _configuration_ and the _custom elements_:

### The Plugin configuration

The plugin must be a valid ES Module. The plugin configuration is an object exported as default and must implement the 
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

    After Webling is loaded, all plugins are dynamically imported and the `onLoad` function of each plugin is called. The `onLoad`
    function gets the plugin context as an argument. The context is described in [The Plugin Context](#the-plugin-context).
    
    The `onLoad` callback should register all custom elements provided in the hooks.
    
    The `onLoad` function can return a Promise if it needs to execute asynchronous actions.

### The Custom Elements 

Plugins can extend webling by registering native [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). 
All custom elements provided by a plugin must start with `plugin-` to be recognised as native custom elements. To avoid 
naming conflicts the custom elements of a plugin should be unique and contain the plugin name.

A Plugin shoud be an encasulated web component. [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
is the perfect tool to encapsulate your plugin:

```Javascript
class PluginCustomElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = '<div id="content"></div>';
    }

    connectedCallback() {
        el.shadowRoot.querySelector('#content').textContent = `Last displayed ${(new DAte()).toLocaleDateString('de-ch')}`;
    }
}
```

#### Events

Some [hooks](#hooks-extension-points) provide event listeners. For example, the `plugin-config` or the `member-grid-menu` 
hook provides an event listener to close the dialog. These listeners are called using native events:

```javascript
this.shadowRoot.dispatchEvent(new CustomEvent('close-dialog', { bubbles: true, composed: true }));
```

Note, that the the second parameter must contain `bubbles: true` to bubble up the dom tree and [`composed: true`](https://developer.mozilla.org/en-US/docs/Web/API/Event/composed)
to allow the custom event to trigger listeners outside of the shadow dom.

#### Attributes

The custom element in some [hooks](#hooks-extension-points) receive context information by custom attributes like the id 
of the member which is displayed in the `member-dialog-sidbar` extention point or the id of the active period in the 
`accounting-panel-navigation` extention point. All attributes are reactive, which means if the underlying property changes, 
the attributes is updated:

```javascript
class PluginMemberDialogSidebar extends HTMLElement {
    static get observedAttributes() { return ['member-id']; }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `<div>Member id: ${this.getAttribute('member-id')}</div>`;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.shadowRoot.innerHTML = `<div>Member id: ${newValue}</div>`;
    }
}
``` 

## Hooks (Extension Points)

To provide Webling with the necessary information to load the plugin, every extension point has a configuration with the name of the
extension point (called hook) and all needed context information.

Webling provides the following hooks for extension:

### The Plugin configuration Dialog

Hook Name: `plugin-config`

This hook allows the plugin to provide a configuration dialog. An example of a configuration dialog can be found here:
[member map example plugin](./examples/member-map#readme)

#### Options

```Javascript
{
    hook: 'plugin-config',
    tagName: 'plugin-my-plugin-configuration' // the name of the custom element representing the configuration interface
}
```

#### Events

- `close-dialog`: close the config dialog

### Add a Page to the Member Panel

Hook Name: `member-panel-navigation`

If you want to extend the member panel with a new page, this hook gives you the possibility to add a navigation
item to the member panel and display a custom view.

#### Options

```Javascript
{
    hook: 'member-panel-navigation',
    label: 'My Plugin Page', // the label of the menu item, which is shown in the member navigation. 
    tagName: 'plugin-my-custom-element' // the name of the custom element representing the new page.
}
```

### Extend the Member Grid Actions

Hook Name:  `member-grid-menu`

If you want to extend the member grid with a new grid action like an export, an aggregation or whatever you can imagine,
with this hook you can extend the member grid with a custom dialog.

#### Options

```Javascript
{
    hook: 'member-grid-menu',
    label: 'My Plugin Gird Export', // the label of the grid menu item, which is shown in the member grid. 
    tagName: 'plugin-my-custom-element', // the name of the custom element representing the new page.
    dialogTitle: 'My Plugin Export dialog', // optional title for the dialog. If no title is provided, the label is displayd
    dialogWidth: 800 // optional with of the dialog in pixels. If no width is provided, the dialog has a with of 900 pixels. 
}
```

#### Attributes

The custom element is provided with two attributes containing the grid selection and the membergroup which is displayed:

- The `member-ids` attribute contains the ids of all selected members in the grid. If no members are selected, the 
  `member-ids` attribute contains the ids of all members in the grid.
- The `membergroup-id` attribute contains the id if the membergroup which is displayed in the grid. This attribute is only
  available if a membergroup is displayed. If a search is executed, a saved search is shown or all members are displayed
  this attribute is empty.

```Javascript
class PluginMyCustomElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <div>MemberIds: ${this.getAttribute('member-ids')}</div>
            <div>Displayed Membergroup: ${this.getAttribute('membergroup-id')}</div>
        `;
    }
}
```

### Extend the Member Dialog Sidebar

Hook Name: `member-dialog-sidbar`

This hook allows the plugin to add information in the member dialog. An example of how to add the last modified time to 
the member dialog can be found in the [member lastmodified example plugin](./examples/member-lastmodified#readme)

#### Options

```Javascript
{
    hook: 'member-dialog-sidbar',
    tagName: 'plugin-my-plugin-configuration' // the name of the custom element we want want to display in the member dialog
}
```

#### Attributes

The custom element is provided with an attribute `member-id` containing the id of the member which is displayed.

```Javascript
class PluginMyCustomElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <div>Displayed id: ${this.getAttribute('member-id')}</div>
        `;
    }
}
```

### Add a Page to the Accounting Panel

Hook Name: `accounting-panel-navigation`

If you want to extend the accounting panel with a new page, this hook gives you the possibility to add a navigation
item to the accounting panel and display a custom view.

#### Options

```Javascript
{
    hook: 'accounting-panel-navigation',
    label: 'My Plugin Page', // the label of the menu item, which is shown in the accounting navigation. 
    tagName: 'plugin-my-custom-element' // the name of the custom element representing the new page.
}
```
#### Attributes

The custom element is provided with an attribute `period-id` containing the id of the active period.

```Javascript
class PluginMyCustomElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <div>Active period: ${this.getAttribute('period-id')}</div>
        `;
    }
}
```

### Add a Page to the Document Panel

Hook Name `document-panel-navigation`

If you want to extend the document panel with a new page, this hook gives you the possibility to add a navigation
item to the document panel and display a custom view.

#### Options

```Javascript
{
    hook: 'document-panel-navigation',
    label: 'My Plugin Page', // the label of the menu item, which is shown in the member navigation. 
    tagName: 'plugin-my-custom-element' // the name of the custom element representing the new page.
}
```

## The Plugin Context

After a Webling plugin is imported, the `onLoad` callback is called. Webling provides the plugin context as the only argument.
The context implements the [`IWeblingPluginContext`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPlugin.ts#L79)
interface and contains the following apis:

### `context.instances`
`context.instances` provides access to the actual data saved in Webling like members, entries or documents. The properties 
of the different instances and the connections between the instances are described in the [Webling API
Documentation](https://demo.webling.ch/api/1).

`context.instances` implements the [`IWeblingPluginInstances`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPlugin.ts#L20)
interface. The interface also contains a list of the names of all object types.

Loaded instances are returned implementing the [`IWeblingPluginInstanceData`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPluginInstanceData.ts#L6)
interface and instance updates must be of the form [`IWeblingPluginInstanceUpdate`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPluginInstanceUpdate.ts#L6).

Each instance type type proides the following methods:

- The `load(id: number): Promise<IWeblingPluginInstanceData>` method loads an instance from the webling backend. 

  ```javascript
  const member = await context.instances.member.load(554);
  const memberLabel = member.label;
  ```

- The `watch(id: number, watcher: () => void): () => void` method allowes to watch a specific instance. The watcher is 
  triggered if the instance has changed. Changes can come from this or another plugin, the webling client itself of a 
  change from another user. The `watch` method returns a callback to stop watching the instance.

  ```javascript
  const member = await context.instances.member.load(554);
  let memberLabel = member.label;
  context.instances.member.watch(554, async () => {
      const member = await context.instances.member.load(554);
      memberLabel = member.label;
  });
  ```

- The `list(options?: { filter?: string; order?: string[] }): Promise<IWeblingPluginInstanceData[]>` method returns
  a list of instances.
  - If no options are passed, all instances of this type are loaded and returned.
  - If a `options.filter` is passed, only the instances are returned which satisfies the filter. The query language used
    to filter the instances is described in the [Query Language](https://demo.webling.ch/api/1#header-query-language) Section
    of the [Webling API Documentation](https://demo.webling.ch/api/1).
  - If a `options.order` is passed, the result is orderd accordingly. E.g. if the `options.order` array is 
    `['Vorname DESC', 'Nachname ASC']` the result is first orderd by `Vorname` descending and instances with equal
    `Vorname` properties are orderd `Nachname` ascending. All path expressions from the [Query Language](https://demo.webling.ch/api/1#header-query-language)
    can be used to sort the results. 
    
  Get all members in the group `Junioren`, which are older than 17 and sort the result by birth year 
  ```javascript
  const members = await context.instances.member.list({ 
      filter: '$parents.title = "Junioren" AND AGE(`Geburtstag`) > 17',
      order: 'YEAR(`Geburtstag`) ASC'
  });
    ```    
  
- The `listIds(options?: { filter?: string; order?: string[] }): Promise<number[]>` method is the same as the `list` method, 
  but it returns only the ids of the matching instances.

  Get all members which have an open debitor and are in a supgroup of `Aktive`, orderd by the remaining amount of the debitor
  ```javascript
  const memberIds = await context.instances.member.list({ 
      filter: '$links.debitor.state="open" AND $ancestors.$label = `Aktive`',
      order: '$links.debitor.remainingamount DESC'
  });
  ```

- The `watchAll(watcher: () => void): () => void` method allowes to watch the list of all instances. The watcher is 
  triggered if an instance is created, an instance is deleted or if the order of the list has changed. Changes can come 
  from this or another plugin, the webling client itself of a change from another user. The `watchAll` methode returns a 
  callback to stop watching the list.

  ```javascript
  let allOpenDebitorsInPeriod = await context.instances.debitor.list({ 
      filter: `$parent.$id = ${this.getAttribute('period-id')}` 
  });
  context.instances.debitor.watchAll(async () => {
      allOpenDebitorsInPeriod = await context.instances.debitor.list({ 
          filter: `$parent.$id = ${this.getAttribute('period-id')}` 
      });
  });
  ```

- The `create(instance: IWeblingPluginInstanceUpdate): Promise<number>` method creates a new instance.

  ```javascript
  const newMembergroupId = await context.instances.membergroup.create({
      properties: {
          title: 'Honored Members'
      },
      children: {
          member: [543, 463]
      },
      parents: [555]
  });
  ```
    
- The `update(id: number, update: IWeblingPluginInstanceUpdate): Promise<void>` method updates the properties, links,
  children or parents of an instance.

  ```javascript
  await context.instances.member.update(295, {
      properties: {
          Funktion: 'Aktuar'
      }
  });
  ```

- The `delete(id: number): Promise<void>` method deletes an instance.

  ```javascript
  const unusedDocuments = await context.instances.document.listIds({ 
      filter: `$parent.$label = "Ungebraucht"` 
  });
  await Promise.all(unusedDocuments.map(async documentId => context.instances.document.delete(documentId)));
  ```

### `context.http`
Since the plugins are loaded from a different origin than Webling the plugin cannot send a fetch request to the webling
backend. Through `context.http` the plugin can send http requests to the webling backend. `context.http` implements the [`IWeblingPluginHttp`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPlugin.ts#L62)
interface.

- The method `get(url: string): Promise` sends a get request to the Webling backend and resolves with the response.

  ```javascript
  const monthlyStats = await context.http.get('period/2230/monthlystats');
  ```

- The method `post(url: string, data?: any): Promise` sends a post request to the Webling backend and resolves with the response.

  ```javascript
  const duplicateMembers = await context.http.post(
      'statistics/duplicatemembers', 
      { "membergroup": 555, "properties": [75] } 
  );
  ```

- The method `put(url: string, data?: any): Promise` sends a put request to the Webling backend and resolves with the response.

- The method `delete(url: string): Promise` sends a delete request to the Webling backend and resolves with the response.

### `context.config`

`context.config` provides access to the plugin configuration. If the plugin needs specific data like API keys for
Google Maps, or some formatting options, you should store these in the configuration object. The configuration
must be a serializable object. The plugin configuration should be managed in an interface which is displayed in the 
`plugin-config` hook. 

`context.config` implements the [`IWeblingPluginConfig`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPlugin.ts#L69)
interface 

The plugin configuration is only writable by the administrator of the Webling Account, but readable for every user.

- The method `get(): Object` returns the current configuration object.

  ```javascript
  const googleMapsApiKey = context.config.get().apiKey;
  ```

- And the configuration can be updated with the `set(config: Object): Promise` method. The returned promise resolves if 
  the configuration is saved to the webling backend.

  ```javascript
  await context.config.set({ ...currentConfig, apiKey: newGoogleMapsApiKey });
  ```

### `context.state`

`context.state` provides access to the plugin state. The state can be any serializable object. In contrast to the
configuration it can be read and written by all users.

`context.state` implements the [`IWeblingPluginState`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPlugin.ts#L74)
interface 

- The method `get(): Object` returns the current state of the plugin.

  ```javascript
  const note = context.state.get().note;
  ```

- And the state can be updated with the `set(config: Object): Promise` method. The returned promise resolves if 
  the state is saved to the webling backend.

  ```javascript
  await context.state.set({ ...state, note: newNote });
  ```

### `context.language`

The language, the Webling user is using. The following languages are possible:

- `de`(German) This is the default language of the vast majority of users.
- `en`(English)
- `fr`(French)

```javascript
const currentLanguage = context.language;
```

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

## How to install and manage your Webling Plugins

A Webling plugin can be installed in the Webling Administration under `Administration` » `Integrationen` » `Plugins`.

## Example Plugins

### [Member Map](./examples/member-map#readme)

An example plugins which shows how to visualize all members on a Google map directly in webling itself.

### [Member Lastmodified](./examples/member-lastmodified#readme)

A plugin which adds the last modification time to the member dialog.
