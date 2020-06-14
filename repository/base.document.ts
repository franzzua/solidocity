import {IFieldInfo, Metadata} from "./metadata";
import {EntitySet} from "./entity-set";
import {fetchDocument, TripleDocument} from "tripledoc";
import {Reference} from "../contracts";
import {WebSocket} from "websocket-polyfill";
import {fs} from "../impl/file.service";

const Fetch = require("../impl/fetch");

export abstract class BaseDocument {
    /** @internal **/
    public doc: TripleDocument;

    constructor(public URI: Reference) {

    }

    public async Init() {
        const fieldInfos = Metadata.Fields.get(this.constructor) ?? [];
        for (const info of fieldInfos) {
            if (info.isArray) {
                this[info.field] = new EntitySet(this, info.Constructor);
            }
        }
        await this.Reload();
        //console.log(`subscribe ${this.URI}`);
        this.Subscribe(this.URI);
    }

    public Loading = Promise.resolve();

    public async Reload() {
        await this.Loading;
        await (this.Loading = new Promise<void>(async resolve => {
            try {
                this.doc = await fetchDocument(this.URI);
            } catch (e) {
                this.doc = await this.CreateDocument();
            }
            if (!this.doc)
                return;
            this.loadFields();
            resolve();
        }));
    }

    protected loadFields(){

        const fieldInfos = Metadata.Fields.get(this.constructor) ?? [];
        for (const info of fieldInfos) {
            this.loadField(info);
        }
    }

    /** @internal **/
    protected loadField(info: IFieldInfo) {
        const entityInfo = Metadata.Entities.get(info.Constructor);
        if (info.isArray) {
            (this[info.field] as EntitySet<any>).Preload();
        }
        const subjects = this.doc.getAllSubjectsOfType(entityInfo.TypeReference);
        if (info.isArray) {
            (this[info.field] as EntitySet<any>).Load(subjects ?? []);
        } else {
            this[info.field] = new info.Constructor((subjects[0] ?? this.doc.addSubject()).asRef(), this);
        }
    }


    /** @internal **/
    protected abstract async CreateDocument(): Promise<TripleDocument>;


    private isSaving = false;
    private SavePromise$ = Promise.resolve();

    public async Save() {
        this.isSaving = true;
        await this.SavePromise$;
        await this.Reload();
        this.isSaving = true;
        await (this.SavePromise$ = new Promise<void>(async resolve => {
            try {
                this.doc = await this.doc.save();
            } catch (e) {
                console.error(e.status);
                await this.Reload();
                this.doc = await this.doc.save();
            }
            resolve();
        }));
        this.loadFields();
        const fieldInfos = Metadata.Fields.get(this.constructor) ?? [];
        for (const info of fieldInfos) {
            if (info.isArray) {
                (this[info.field] as EntitySet<any>).Save();
            }
        }
        this.isSaving = false;
    }


    public async Remove() {
        await fs.deleteFile(this.URI);
        this.listeners.delete.forEach(f => f({
            type: 'delete',
            detail: this
        }));
    }

    private _webSocketCache: Promise<WebSocket>;

    private async GetWebSocket() {
        if (this._webSocketCache)
            return this._webSocketCache;
        const optRes = await Fetch(this.URI, {method: 'GET'})
        const wssUrl = optRes.headers.get('updates-via');
        const ws = new WebSocket(wssUrl);
        return this._webSocketCache = new Promise(resolve => ws.onopen = resolve).then(() => ws);
    }

    public async Subscribe(uri: Reference = this.URI, cb?: () => void) {
        const ws = await this.GetWebSocket();
        ws.send(`sub ${uri}`);
        ws.onmessage = async message => {
            const [, action, reference] = message.data.match(/(ack|pub) (.*)/);
            switch (action) {
                case "ack":
                    break;
                case "pub":
                    if (!this.isSaving) {
                        cb && cb();
                        await this.Reload();
                        this.listeners.update.forEach(f => f({
                            type: 'update',
                            detail: this
                        }));
                    }
            }
        };
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
