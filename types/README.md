# Webling Plugin Types

[Webling](https://www.webling.ch) is a software for associations that perfectly matches individual requirements. Whether 
it is a sports club, umbrella organization or a non-profit association, the software adapts easily to their needs.

Webling is extensible by plugins. This package contains the typings of a Webling Plugin. The full documentation on 
how to write a Webling Plugin can be found in [Webling Plugin GitHub Repo](https://github.com/usystems/webling-plugins#readme)

## The Webling Plugin Format

A Webling Plugin is a ES Module, which default exports an object which implements the [`IWeblingPlugin`](https://github.com/usystems/webling-plugins/blob/main/types/IWeblingPlugin.ts#L96)
interface. For more information look at the [documentation of the plugin configuration](https://github.com/usystems/webling-plugins#the-plugin-configuration) 
