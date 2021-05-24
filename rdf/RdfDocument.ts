import {Reference} from "../contracts";
import {ulid} from "ulid";
import {authFetch} from "../impl/auth";
import {RdfSubject} from "./RdfSubject";
import {RdfStore} from "./RdfStore";
import {triplesToTurtle, turtleToTriples} from "./parse";
import {DataFactory} from "n3";

export class RdfDocument {
    // private tripleDoc: TripleDocument;
    private headers: Headers;


    constructor(public URI: Reference, private options: {
        createIfNotExists: boolean
    } = {
        createIfNotExists: true
    }) {
    }

    public Loading = Promise.resolve();

    public async Load() {
        await this.Loading;
        this.Loading = this.load();
        await this.Loading;
    }

    private async load() {
        const response = await authFetch(this.URI, {

            headers: {
                Accept: 'text/turtle',
            },
        });
        this.headers = response.headers;
        if (response.ok) {
            const turtle = await response.text();
            const triples = await turtleToTriples(turtle, this.URI);
            this.Store.merge(triples);
        } else {

        }
    }


    public Store = new RdfStore();


    public getSubjectsOfType(type: Reference): ReadonlyArray<RdfSubject> {
        return [...this.Store.Subjects.values()]
            .filter(x => x.Type == type);
        // return this.tripleDoc.getAllSubjectsOfType(type)
        //     .map(subject => new RdfSubject(subject, this));
    }

    public getSubject(uri: Reference): RdfSubject {
        const tripleSubject = [...this.Store.Subjects.values()]
            .find(x => x.URI == uri);
        if (!tripleSubject)
            return this.addSubject(uri);
        return tripleSubject;
    }

    /** @internal **/
    public async CreateDocument(): Promise<void> {
        throw new Error('not implemented yet');
        //await fs.createFolder(this.URI.split('/').slice(0, -1).join('/'));
        // const doc = await createDocument(this.URI);
        // this.tripleDoc = await doc.save();
    }


    addSubject(uri: Reference = `${this.URI}#${ulid()}`) {
        return this.Store.create(uri);
    }

    removeSubject(uri: Reference) {
        this.Store.removeAll(uri);
    }

    private SavePromise$ = Promise.resolve();

    async Save() {
        const response = await authFetch(this.URI, {method: 'HEAD'});
        if (!response.ok){
            const changes = this.Store.getChanges();
            const turtle = await triplesToTurtle(changes.add);
            const res = await authFetch(this.URI, {
                method: 'PUT',
                body: turtle,
                headers: {
                    'Content-Type': 'text/turtle',
                    'If-None-Match': '*',
                }
            });
            const text = await res.text();
            if (!res.ok){
                console.error(text);
            }
        } else {
            const changes = this.Store.getChanges();
            const remove = await triplesToTurtle(changes.delete);
            const deleteWhere =  remove.replace(/\_\:/g, '?');
            const insert = await triplesToTurtle(changes.add);

            const body = `
            INSERT DATA {
                ${insert}
            };
            DELETE WHERE {
                ${deleteWhere}
            };
            `;
            try {
                const resp = await authFetch(this.URI, {
                    method: 'PATCH',
                    body: body,
                    headers: {
                        'Content-Type': 'application/sparql-update'
                    }
                });
                const text = await resp.text();
            }catch (e) {
                console.error(e);
            }
        }
        // throw new Error('not implemented yet');
        // await (this.SavePromise$ = new Promise<void>(async resolve => {
        //     try {
        //         // this.tripleDoc = await this.tripleDoc.save();
        //     } catch (e) {
        //         if (e.status == '409') {
        //             await this.Load();
        //             // this.tripleDoc = await this.tripleDoc.save();
        //         } else {
        //             throw e;
        //         }
        //     }
        //     resolve();
        // }));
    }

    async getWebSocketRef() {
        // const wssUrl = this.tripleDoc.getWebSocketRef();
        // if (wssUrl != null) {
        //     return wssUrl;
        // }
        if (this.headers.has('updates-via')) {
            return this.headers.get('updates-via');
        }
        throw new Error("failed to find wssUrl");
    }

    getAclRef(): Reference {
        const acl = this.Link?.acl;
        if (!acl)
            return null;
        if (acl.startsWith('http'))
            return acl;
        return this.URI.split('/').slice(0, -1).join('/') + '/' + acl;
    }

    private get Link(): {
        [type: string]: Reference;
    } {
        if (!this.headers.has('Link')) {
            return null;
        }
        const link = [
            ...(this.headers.get('Link') as string)
                .matchAll(/\<([\w\d\.\/\:\#]*)\>; rel\="(\w*)"/g)
        ].reduce((obj, match) => {
            obj[match[2]] = match[1];
            return obj;
        }, {});
        return link;
    }
}


