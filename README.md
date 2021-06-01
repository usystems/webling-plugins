# Webling Plugins

Webling is a managment software for clubs and associations. It is extensible by plugins. This repo combins all ressources
around the development of webling plugins.

## Design rationale

Webling plugins are microfrontends and are completely framework agnostic. The orchestration is based on web standards:

- A plugin is represented by an ES Module which is imported at runtime.
- A plugin provides custom elements to extend webling
