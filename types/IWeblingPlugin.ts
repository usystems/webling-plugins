/**
 * @author Lukas Gamper, lukas.gamper@usystems.ch
 * @copyright uSystems GmbH, www.usystems.ch
 */

import type IWeblingPluginInstanceData from './IWeblingPluginInstanceData';
import type IWeblingPluginInstanceUpdate from './IWeblingPluginInstanceUpdate';

export interface IWeblingPluginInstance {
	create(instance: IWeblingPluginInstanceUpdate): Promise<number>;
	load(id: number): Promise<IWeblingPluginInstanceData>;
	update(id: number, update: IWeblingPluginInstanceUpdate): Promise<void>;
	delete(id: number): Promise<void>;
	watch(id: number, watcher: () => void): () => void;
	watchAll(watcher: () => void): () => void;
	list(options?: { filter?: string; order?: string[] }): Promise<IWeblingPluginInstanceData[]>;
	listIds(options?: { filter?: string; order?: string[] }): Promise<number[]>;
}

export interface IWeblingPluginInstances {
	account: IWeblingPluginInstance;
	accountgroup: IWeblingPluginInstance;
	accountgrouptemplate: IWeblingPluginInstance;
	accounttemplate: IWeblingPluginInstance;
	apikey: IWeblingPluginInstance;
	article: IWeblingPluginInstance;
	articlegroup: IWeblingPluginInstance;
	attendance: IWeblingPluginInstance;
	comment: IWeblingPluginInstance;
	costcenter: IWeblingPluginInstance;
	debitor: IWeblingPluginInstance;
	debitorcategory: IWeblingPluginInstance;
	document: IWeblingPluginInstance;
	documentgroup: IWeblingPluginInstance;
	domain: IWeblingPluginInstance;
	email: IWeblingPluginInstance;
	emailattachment: IWeblingPluginInstance;
	emailimage: IWeblingPluginInstance;
	entry: IWeblingPluginInstance;
	entrygroup: IWeblingPluginInstance;
	event: IWeblingPluginInstance;
	letter: IWeblingPluginInstance;
	letterimage: IWeblingPluginInstance;
	letterpdf: IWeblingPluginInstance;
	member: IWeblingPluginInstance;
	memberform: IWeblingPluginInstance;
	membergroup: IWeblingPluginInstance;
	payment: IWeblingPluginInstance;
	period: IWeblingPluginInstance;
	periodchain: IWeblingPluginInstance;
	periodgroup: IWeblingPluginInstance;
	rnwform: IWeblingPluginInstance;
	rnwmerchant: IWeblingPluginInstance;
	sms: IWeblingPluginInstance;
	template: IWeblingPluginInstance;
	user: IWeblingPluginInstance;
	usergroup: IWeblingPluginInstance;
	// fallback to stay compatible with instance types introduced in the future
	[instanceType: string]: IWeblingPluginInstance;
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
	watch(watcher: () => void): () => void;
}

export interface IWeblingPluginState {
	get(): any;
	set(state: any): Promise<void>;
	watch(watcher: () => void): () => void;
}

export interface IWeblingPluginPrefs {
	get(): any;
	set(prefs: any): Promise<void>;
	watch(watcher: () => void): () => void;
}

export interface IWeblingPluginContext {
	instances: IWeblingPluginInstances;
	http: IWeblingPluginHttp;
	config: IWeblingPluginConfig;
	state: IWeblingPluginState;
	prefs: IWeblingPluginPrefs;
	language: 'de' | 'en' | 'fr';
}

export default interface IWeblingPlugin {
	name: string;
	apiversion: 1;
	pluginversion: string;
	hooks: ({
		hook: 'member-panel-navigation' | 'accounting-panel-navigation' | 'document-panel-navigation';
		label: string | (() => string);
		element: { new (...params: any[]): HTMLElement };
	} | {
		hook: 'member-dialog-sidebar' | 'plugin-config';
		element: { new (...params: any[]): HTMLElement };
	} | {
		hook: 'member-grid-menu';
		label: string | (() => string);
		element: { new (...params: any[]): HTMLElement };
		dialogTitle?: string;
		dialogWidth?: number;
	})[];
	onLoad?(context: IWeblingPluginContext): void | Promise<void>;
}
