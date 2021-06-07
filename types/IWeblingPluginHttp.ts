/**
 * @author Lukas Gamper, lukas.gamper@usystems.ch
 * @copyright uSystems GmbH, www.usystems.ch
 */

export default interface IWeblingPluginHttp {
	get<Result = any>(url: string): Promise<Result>;
	post<Result = any>(url: string, data?: any): Promise<Result>;
	put<Result = any>(url: string, data?: any): Promise<Result>;
	delete<Result = any>(url: string): Promise<Result>;
}
