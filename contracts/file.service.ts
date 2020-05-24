import {SolidApi} from "./api";

export abstract class SolidFileService extends SolidApi {
    /**
     * Fetch an item and return content as text,json,or blob as needed
     * @param {string} url
     * @param {RequestInit} [request]
     * @returns {Promise<string|Blob|Response>}
     */
    public abstract readFile(url, request): Promise<any>;

    public abstract readHead(url, options?): Promise<string>;

    public abstract deleteFile(url): Promise<any>;

    public abstract deleteFolder(url, options?): Promise<any>;
}

