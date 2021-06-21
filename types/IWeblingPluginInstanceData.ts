/**
 * @author Lukas Gamper, lukas.gamper@usystems.ch
 * @copyright uSystems GmbH, www.usystems.ch
 */

export default interface IWeblingPluginInstanceData {
	readonly type: string;
	readonly label: string;
	readonly meta: {
		created: Date | null;
		lastmodified: Date | null;
		lat?: number;
		lng?: number;
	};
	readonly readonly: boolean;
	readonly properties: {
		readonly [propertyName: string]: any;
	};
	readonly links: {
		readonly [category: string]: number[];
	};
	readonly children: {
		readonly [childType: string]: number[];
	};
	readonly parents: number[];
}
