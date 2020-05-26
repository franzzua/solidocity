export type Reference = string;

export abstract class SolidApi {
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
    /**
     * Fetch a resource with the passed fetch method
     * @param {string} url
     * @param {RequestInit} [options]
     * @returns {Promise<Response>} resolves if response.ok is true, else rejects the response
     */
    public abstract fetch(url, options?: IWriteOptions): PromiseLike<any>;

    /**
     * Send get request
     * @param {string} url
     * @param {RequestInit} [options]
     * @returns {Promise<Response>}
     */
    public abstract get(url, options?: IWriteOptions): PromiseLike<any>;

    /**
     * Send delete request
     * @param {string} url
     * @param {RequestInit} [options]
     * @returns {Promise<Response>}
     */
    public abstract delete(url, options?: IWriteOptions): PromiseLike<any>;

    /**
     * Send post request
     * @param {string} url
     * @param {RequestInit} [options]
     * @returns {Promise<Response>}
     */
    public abstract post(url, options?: IWriteOptions): PromiseLike<any>;

    /**
     * Send put request
     * @param {string} url
     * @param {RequestInit} [options]
     * @returns {Promise<Response>}
     */
    public abstract put(url, options?: IWriteOptions): PromiseLike<any>;

    /**
     * Send patch request
     * @param {string} url
     * @param {RequestInit} [options]
     * @returns {Promise<Response>}
     */
    public abstract patch(url, options?: IWriteOptions): PromiseLike<any>;

    /**
     * Send head request
     * @param {string} url
     * @param {RequestInit} [options]
     * @returns {Promise<Response>}
     */
    public abstract head(url, options?: IWriteOptions): PromiseLike<any>;

    /**
     * Send options?: IWriteOptions request
     * @param {string} url
     * @param {RequestInit} [options]
     * @returns {Promise<Response>}
     */
    public abstract options(url, options?: IWriteOptions): PromiseLike<any>;

    /**
     * Check if item exists.
     * Return false if status is 404. If status is 403 (or any other "bad" status) reject.
     * @param {string} url
     * @returns {Promise<boolean>}
     */
    public abstract itemExists(url): Promise<boolean>;

    /**
     * Create an item at target url.
     * Per default it will create the parent folder if it doesn't exist.
     * @param {string} url
     * @param {Blob|string} content
     * @param {string} contentType
     * @param {string} link - header for Container/Resource, see LINK in apiUtils
     * @param {WriteOptions} [options] - only uses createPath option
     * @returns {Promise<Response>}
     */
    public abstract postItem(url, content, contentType, link, options?: IWriteOptions): Promise<any>;

    /**
     * Create a folder if it doesn't exist.
     * Per default it will resolve when the folder already existed
     * @param {string} url
     * @param {WriteOptions} [options]
     * @returns {Promise<Response>} Response of HEAD request if it already existed, else of creation request
     */
    public abstract createFolder(url, options?: IWriteOptions): Promise<any>;

    /**
     * Create a new file.
     * @param {string} url
     * @param {Blob|String} content
     * @param {WriteOptions} [options]
     * @returns {Promise<Response>}
     */
    public abstract postFile(url, content, contentType, options?: IWriteOptions): Promise<any>;

    /**
     * Create a new file.
     * Per default it will overwrite existing files
     * @param {string} url
     * @param {Blob|String} content
     * @param {WriteOptions} [options]
     * @returns {Promise<Response>}
     */
    public abstract createFile(url, content, contentType, options?: IWriteOptions): PromiseLike<any>;

    /**
     * Create a file using PUT
     * Per default it will overwrite existing files
     * @param {string} url
     * @param {Blob|String} content
     * @param {WriteOptions} [options]
     * @returns {Promise<Response>}
     */
    public abstract putFile(url, content, contentType, options?: IWriteOptions): Promise<IDBRequest<IDBValidKey>>;

    /**
     * Fetch and parse a folder
     * @param {string} url
     * @param {ReadFolderOptions} [options]
     * @returns {Promise<FolderData>}
     */
    public abstract readFolder(url, options?: IWriteOptions): Promise<IFolder>;

    /**
     * Get acl and meta links of an item
     * @param {string} url
     * @param {object} [options] specify if links should be checked for existence or not
     * @returns {Promise<Links>}
     */
    public abstract getItemLinks(url, options?: IWriteOptions): Promise<any>;

    /**
     * Remove all links which are not existing of a links object
     * @param {Links} links
     * @returns {Promise<void>}
     * @private
     */
    public abstract _removeInexistingLinks(links): Promise<void>;

    /**
     * Copy a file.
     * Per default overwrite existing files and copy links too.
     * @param {string} from - Url where the file currently is
     * @param {string} to - Url where it should be copied to
     * @param {WriteOptions} [options]
     * @returns {Promise<Response>} - Response from the new file created
     */
    public abstract copyFile(from, to, options?: IWriteOptions): Promise<IDBRequest<IDBValidKey>>;

    /**
     * Checks that urls for copying a link file are defined,
     * @param {string} from
     * @param {string} to
     * @returns {Promise<boolean>} true if both are defined, else false
     * @throws {FetchError} throws when from is defined and exists, but to is undefined
     * @private
     */
    protected abstract _linkUrlsDefined(from, to): Promise<boolean>;

    /**
     * Copy a meta file
     * @param {string} oldTargetFile
     * @param {string} newTargetFile
     * @param {WriteOptions} [options]
     * @returns {Promise<Response|undefined>} creation response
     */
    public abstract copyMetaFileForItem(oldTargetFile, newTargetFile, options?: IWriteOptions): Promise<IDBRequest<IDBValidKey> | undefined>;

    /**
     * Copy an ACL file
     * @param {string} oldTargetFile Url of the file the acl file targets (e.g. file.ttl for file.ttl.acl)
     * @param {string} newTargetFile Url of the new file targeted (e.g. new-file.ttl for new-file.ttl.acl)
     * @param {WriteOptions} [options]
     * @returns {Promise<Response>} creation response
     */
    public abstract copyAclFileForItem(oldTargetFile, newTargetFile, options?: IWriteOptions): Promise<IDBRequest<IDBValidKey> | undefined>;

    /**
     * Copy links for an item. Use withAcl and withMeta options?: IWriteOptions to specify which links to copy
     * Does not throw if the links don't exist.
     * @param {string} oldTargetFile Url of the file the acl file targets (e.g. file.ttl for file.ttl.acl)
     * @param {string} newTargetFile Url of the new file targeted (e.g. new-file.ttl for new-file.ttl.acl)
     * @param {WriteOptions} [options]
     * @returns {Promise<Response[]>} creation responses
     */
    public abstract copyLinksForItem(oldTargetFile, newTargetFile, options?: IWriteOptions): Promise<any[]>;

    /**
     * Copy a folder and all contents.
     * Per default existing folders will be deleted before copying and links will be copied.
     * @param {string} from
     * @param {string} to
     * @param {WriteOptions} [options]
     * @returns {Promise<Response[]>} Resolves with an array of creation responses.
     * The first one will be the folder specified by "to".
     * The others will be creation responses from the contents in arbitrary order.
     */
    public abstract copyFolder(from, to, options?: IWriteOptions): Promise<any[]>;

    /**
     * Copy a file (url ending with file name) or folder (url ending with "/").
     * Per default existing folders will be deleted before copying and links will be copied.
     * @param {string} from
     * @param {string} to
     * @param {WriteOptions} [options]
     * @returns {Promise<Response[]>} Resolves with an array of creation responses.
     * The first one will be the folder specified by "to".
     * If it is a folder, the others will be creation responses from the contents in arbitrary order.
     */
    public abstract copy(from, to, options?: IWriteOptions): Promise<any[]> | void;

    /**
     * Delete a file and its links
     * @param {string} itemUrl
     * @returns {Promise<Response>} response of the file deletion
     * @private
     */
    protected abstract _deleteItemWithLinks(itemUrl): Promise<any>;

    /**
     * Delete all folders and files inside a folder
     * @param {string} url
     * @returns {Promise<Response[]>} Resolves with a response for each deletion request
     */
    public abstract deleteFolderContents(url): Promise<any>;

    /**
     * Delete a folder, its contents and links recursively
     * @param {string} url
     * @returns {Promise<Response[]>} Resolves with an array of deletion responses.
     * The first one will be the folder specified by "url".
     * The others will be the deletion responses from the contents in arbitrary order
     */
    public abstract deleteFolderRecursively(url): Promise<any>;

    /**
     * Move a file (url ending with file name) or folder (url ending with "/").
     * Shortcut for copying and deleting items
     * @param {string} from
     * @param {string} to
     * @param {WriteOptions} [copyOptions]
     * @returns {Promise<Response[]>} Responses of the copying
     */
    public abstract move(from, to, copyOptions): Promise<any>;

    /**
     * Rename a file (url ending with file name) or folder (url ending with "/").
     * Shortcut for moving items within the same directory
     * @param {string} url
     * @param {string} newName
     * @param {RequestOptions} [moveOptions]
     * @returns {Promise<Response[]>} Response of the newly created items
     */
    public abstract rename(url, newName, moveOptions): Promise<any>;
}

export enum AGENT {
    NO_MODIFY= 'no_modify',
    TO_TARGET= 'to_target',
    TO_SOURCE= 'to_source'
}

export enum MERGE {
    REPLACE= 'replace',
    KEEP_SOURCE= 'keep_source',
    KEEP_TARGET= 'keep_target'
}

export interface IWriteOptions {
    withAcl?: boolean;
    withMeta?: boolean;
    agent?: AGENT,
    merge?: MERGE,
    createPath?: boolean;
}

export interface IFile {
    "type": "file" | "folder",
    "modified": string,
    "mtime": string,
    "size": string,
    "itemType": "Container",
    "name": string,
    "parent": string,
    "url": string,
}

export interface IFolder extends IFile {
    "type": "folder",
    files: IFile[]
    folders: IFile[]
}

