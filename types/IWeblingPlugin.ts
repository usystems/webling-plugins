/**
 * @author Lukas Gamper, lukas.gamper@usystems.ch
 * @copyright uSystems GmbH, www.usystems.ch
 */

import type IWeblingPluginContext from './IWeblingPluginContext';

export default interface IWeblingPlugin {

	/**
	 * The name of the plugin. This is used to identify the plugin
	 */
	name: string;

	apiversion: 1;

	pluginversion: string;

	/**
	 * Hooks, where the plugin should be displayed
	 */
	hooks: ({
		hook: 'member-panel' | 'accounting-panel' | 'document-panel';
		label: string;
		tagName: string;
	} | {
		hook: 'member-dialog-sidebar' | 'plugin-config';
		tagName: string;
	})[];

	/**
	 * function to install the plugin
	 */
	onLoad(context: IWeblingPluginContext): void | Promise<void>;
}
