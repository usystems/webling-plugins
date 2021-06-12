/**
 * @author Lukas Gamper, lukas.gamper@usystems.ch
 * @copyright uSystems GmbH, www.usystems.ch
 */

import type IWeblingPluginInstances from './IWeblingPluginInstances';
import type IWeblingPluginHttp from './IWeblingPluginHttp';
import type IWeblingPluginConfig from './IWeblingPluginConfig';
import type IWeblingPluginState from './IWeblingPluginState';

export default interface IWeblingPluginContext {
	instances: IWeblingPluginInstances;
	http: IWeblingPluginHttp;
	config: IWeblingPluginConfig;
	state: IWeblingPluginState;
	language: 'de' | 'en' | 'fr';
}
