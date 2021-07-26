import {Reference} from "../../contracts";
import {authFetch} from "../../impl/auth";
import {triplesToTurtle, turtleToTriples} from "../parse";
import {Triple} from "n3";
import {Change} from "../change";
import {IRdfRepository} from "../RdfDocument";

export class HttpRdfRepository implements IRdfRepository {
    constructor(private URI: Reference) {
    }

    private headers: Headers;

    public async load(): Promise<ReadonlyArray<Triple>> {
        const response = await authFetch(this.URI, {
            headers: {
                Accept: 'text/turtle',
            },
        });
        this.headers = response.headers;
        if (response.ok) {
            const turtle = await response.text();
            const triples = await turtleToTriples(turtle, this.URI);
            return triples;
            // this.persistance.merge(triples);
            // this.Store.merge(triples);
        } else {
            const reason = await response.text();
            console.warn('document', this.URI, ' not loaded: ', reason);
            return [];
        }
    }

    async saveChanges(changes: Change<Triple>) {
        const response = await authFetch(this.URI, {method: 'HEAD'});
        if (!response.ok) {
            await this.create(changes);
        } else {
            await this.update(changes);
        }
    }


    private async create(change: Change<Triple>) {
        const turtle = await triplesToTurtle(change.add);
        const res = await authFetch(this.URI, {
            method: 'PUT',
            body: turtle,
            headers: {
                'Content-Type': 'text/turtle',
                'If-None-Match': '*',
            }
        });
        const text = await res.text();
        if (!res.ok) {
            console.error(text);
        }
    }

    private async update(change: Change<Triple>) {
        const remove = await triplesToTurtle(change.remove);
        const deleteQuery = /\_\:/.test(remove)
            ? `DELETE WHERE { ${remove.replace(/\_\:/g, '?')} } `
            : `DELETE { ${remove} }`;
        const insert = await triplesToTurtle(change.add);
        const body = `
            INSERT DATA {
                ${insert}
            };
            ${deleteQuery};
            `;
        const resp = await authFetch(this.URI, {
            method: 'PATCH',
            body: body,
            headers: {
                'Content-Type': 'application/sparql-update'
            }
        });
        const text = await resp.text();
        if (!resp.ok) {
            debugger;
            throw new Error(text);
        }
    }

    getWebSocketRef() {
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
        const acl = this.LinkHeader?.acl;
        if (!acl)
            return null;
        if (acl.startsWith('http'))
            return acl;
        return this.URI.split('/').slice(0, -1).join('/') + '/' + acl;
    }

    public get LinkHeader(): {
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


    public async Subscribe(listener: (triples: ReadonlyArray<Triple>) => void): Promise<() => void> {
        const wsRef = this.getWebSocketRef();
        const webSocket = await WebSocketFactory.GetWebSocket(wsRef);
        webSocket.send(`sub ${this.URI}`);
        await new Promise<void>(resolve => {
            webSocket.addEventListener('message', async message => {
                if (!message.data.match(/(ack|pub) (.*)/)) {
                    return;
                }
                const [, action, reference] = message.data.match(/(ack|pub) (.*)/);
                switch (action) {
                    case "ack":
                        resolve();
                        break;
                    case "pub":
                        const items = await this.load()
                        listener(items);
                        break;
                }
            });
        });
        return () => webSocket.close();
    }

}

export class WebSocketFactory {

    private static _webSocketCache = new Map<Reference, Promise<WebSocket>>();

    public static async GetWebSocket(wssUrl) {
        if (WebSocketFactory._webSocketCache.has(wssUrl)) {
            return await WebSocketFactory._webSocketCache.get(wssUrl);
        }
        const ws = new WebSocket(wssUrl);
        const wsPromise = new Promise((resolve, reject) => {
            ws.addEventListener('open', resolve);
            ws.addEventListener('error', reject);
        }).then(() => ws);
        WebSocketFactory._webSocketCache.set(wssUrl, wsPromise);
        return await wsPromise;
    }
}
