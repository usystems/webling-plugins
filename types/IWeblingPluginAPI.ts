/**
 * @author Lukas Gamper, lukas.gamper@usystems.ch
 * @copyright uSystems GmbH, www.usystems.ch
 */

import type IWeblingPluginInstanceData from './IWeblingPluginInstanceData';
import type IWeblingPluginInstanceUpdate from './IWeblingPluginInstanceUpdate';

export default interface IWeblingPluginAPI {
	[instanceType: string]: {
		create(member: IWeblingPluginInstanceUpdate): Promise<number>;
		load(id: number): Promise<IWeblingPluginInstanceData>;
		update(id: number, update: IWeblingPluginInstanceUpdate): Promise<void>;
		delete(id: number): Promise<void>;
		watch(id: number, watcher: () => void): () => void;
		watchAll(watcher: () => void): () => void;
		list(options?: { filter?: string; order?: string[] }): Promise<IWeblingPluginInstanceData[]>;
		listIds(options?: { filter?: string; order?: string[] }): Promise<number[]>;
	};
}
