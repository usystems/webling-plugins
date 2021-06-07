/**
 * @author Lukas Gamper, lukas.gamper@usystems.ch
 * @copyright uSystems GmbH, www.usystems.ch
 */

export default interface IWeblingPluginConfig {
	get(): { [key: string]: any };
	set(config: { [key: string]: any }): Promise<void>;
}
