/**
 * @author Lukas Gamper, lukas.gamper@usystems.ch
 * @copyright uSystems GmbH, www.usystems.ch
 */

export default interface IWeblingPluginInstanceUpdate {
	properties?: {
		[propertyName: string]: any;
	};
	links?: {
		[category: string]: number[];
	};
	children?: {
		[childType: string]: number[];
	};
	parents?: number[];
}
