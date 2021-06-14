import {IFieldInfo, Metadata} from "./helpers/metadata";
import {EntitySet} from "./entity-set";
import {Reference} from "../contracts";
import { authFetch } from "../impl/auth";
import {RdfDocument} from "../rdf/RdfDocument";
import {Entity} from "./entity";

export abstract class BaseDocument {
    /** @internal **/
    // public doc: TripleDocument;

    public rdfDoc = new RdfDocument(this.URI.split('#')[0], this.options);

    constructor(public URI: Reference, private options: {
        createInNotExists: boolean;
        persistance: boolean;
    } = {
        createInNotExists: true,
        persistance: false
    }) {
        this.URI = this.URI.split('#')[0];
        this.InitMetadata();
    }

    private InitMetadata(){
        const fieldInfos = Metadata.Fields.get(this.constructor) ?? [];
        for (const info of fieldInfos) {
            if (info.isArray) {
                this[info.field] = new EntitySet(this, info.Constructor);
            }
        }
    }

    public async Init() {
        await this.rdfDoc.Load();
        this.loadFields();
    }

    protected loadFields(){
        const fieldInfos = Metadata.Fields.get(this.constructor) ?? [];
        for (const info of fieldInfos) {
            const entityInfo = Metadata.Entities.get(info.Constructor);
            if (info.isArray) {
                const subjects = this.rdfDoc.getSubjectsOfType(entityInfo.TypeReference);
                (this[info.field] as EntitySet<any>).Load(subjects ?? []);
            } else {
                const subject = this.rdfDoc.getSubject(`${this.URI}${info.id}`)
                if (!this[info.field]) {
                    this[info.field] = new info.Constructor(subject, this);
                }else{
                    (this[info.field] as Entity).Subject = subject;
                    (this[info.field] as Entity).Load();
                }
            }
        }
    }

    private isSaving = false;

    public async Save() {
        this.isSaving = true;
        // await this.Reload();
        this.isSaving = true;

        await this.rdfDoc.Save();
        this.loadFields();
        this.isSaving = false;
    }


    public async Remove() {
        await authFetch(this.URI, {method: 'DELETE'});
        this.listeners.delete.forEach(f => f({
            type: 'delete',
            detail: this
        }));
    }

    private static _webSocketCache = new Map<Reference, Promise<WebSocket>>();

    private async GetWebSocket() {
        const wssUrl = await this.rdfDoc.getWebSocketRef();
        if (BaseDocument._webSocketCache.has(wssUrl)){
            return await BaseDocument._webSocketCache.get(wssUrl);
        }
        const ws = new WebSocket(wssUrl);
        const wsPromise = new Promise((resolve,reject) => {
            ws.addEventListener('open', resolve);
            ws.addEventListener('error', reject);
        }).then(() => ws);
        BaseDocument._webSocketCache.set(wssUrl, wsPromise);
        return await wsPromise;
    }

    public async Subscribe(uri: Reference = this.URI, cb?: () => void) {
        const ws = await this.GetWebSocket();
        ws.send(`sub ${uri}`);
        await new Promise<void>(resolve => {
            ws.addEventListener('message', async message => {
                if (!message.data.match(/(ack|pub) (.*)/)){
                    return;
                }
                const [, action, reference] = message.data.match(/(ack|pub) (.*)/);
                switch (action) {
                    case "ack":
                        resolve();
                        break;
                    case "pub":
                        if (!this.isSaving) {
                            cb && cb();
                            await this.Init();
                            this.listeners.update.forEach(f => f({
                                type: 'update',
                                reference,
                                detail: this
                            }));
                        }
                }
            });
        });
    }

    public async Unsubscribe(){
        const ws = await this.GetWebSocket();
        this.listeners.update = [];
        this.listeners.delete = [];
        ws.close();
    }


    private listeners = {
        update: [],
        delete: []
    };

    public on(event: 'update' | 'delete', listener) {
        this.listeners[event].push(listener);
        return () => {
            const index = this.listeners[event].indexOf(listener);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }

}
