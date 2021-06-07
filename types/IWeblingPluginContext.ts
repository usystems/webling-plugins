/**
 * @author Lukas Gamper, lukas.gamper@usystems.ch
 * @copyright uSystems GmbH, www.usystems.ch
 */

import type IWeblingPluginAPI from './IWeblingPluginAPI';
import type IWeblingPluginHttp from './IWeblingPluginHttp';
import type IWeblingPluginConfig from './IWeblingPluginConfig';
import type IWeblingPluginState from './IWeblingPluginState';

export default interface IWeblingPluginContext {
	weblingAPI: IWeblingPluginAPI;
	http: IWeblingPluginHttp;
	config: IWeblingPluginConfig;
	state: IWeblingPluginState;
	language: 'de' | 'en' | 'fr';
}
