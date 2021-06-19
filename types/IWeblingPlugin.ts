/**
 * @author Lukas Gamper, lukas.gamper@usystems.ch
 * @copyright uSystems GmbH, www.usystems.ch
 */

import type IWeblingPluginInstanceData from './IWeblingPluginInstanceData';
import type IWeblingPluginInstanceUpdate from './IWeblingPluginInstanceUpdate';

export interface IWeblingPluginInstances {
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

export interface IWeblingPluginHttp {
	get<Result = any>(url: string): Promise<Result>;
	post<Result = any>(url: string, data?: any): Promise<Result>;
	put<Result = any>(url: string, data?: any): Promise<Result>;
	delete<Result = any>(url: string): Promise<Result>;
}

export interface IWeblingPluginConfig {
	get(): { [key: string]: any };
	set(config: { [key: string]: any }): Promise<void>;
}

export interface IWeblingPluginState {
	get(): any;
	set(state: any): Promise<void>;
}

export interface IWeblingPluginContext {
	instances: IWeblingPluginInstances;
	http: IWeblingPluginHttp;
	config: IWeblingPluginConfig;
	state: IWeblingPluginState;
	language: 'de' | 'en' | 'fr';
}

export default interface IWeblingPlugin {
	name: string;
	apiversion: 1;
	pluginversion: string;
	hooks: ({
		hook: 'member-panel-navigation' | 'accounting-panel-navigation' | 'document-panel-navigation';
		label: string;
		tagName: string;
	} | {
		hook: 'member-dialog-sidebar' | 'plugin-config';
		tagName: string;
	} | {
		hook: 'member-grid-menu';
		label: string;
		tagName: string;
		dialogTitle?: string;
		dialogWidth?: number;
	})[];
	onLoad(context: IWeblingPluginContext): void | Promise<void>;
}
