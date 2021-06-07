/**
 * @author Lukas Gamper, lukas.gamper@usystems.ch
 * @copyright uSystems GmbH, www.usystems.ch
 */

export default interface IWeblingPluginState {
	get(): any;
	get(state: any): Promise<void>;
}
