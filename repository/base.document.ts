import {IFieldInfo, Metadata} from "./metadata";
import {EntitySet} from "./entity-set";
import {fetchDocument, TripleDocument} from "tripledoc";
import {Fetch} from "../impl/fetch";
import {Reference} from "../contracts";

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
        console.log(`subscribe ${this.URI}`);
        this.Subscribe(this.URI);
    }

    private ReloadPromise = Promise.resolve();

    public async Reload() {
        await this.ReloadPromise;
        await (this.ReloadPromise = new Promise<void>(async resolve => {
            try {
                this.doc = await fetchDocument(this.URI);
            } catch (e) {
                this.doc = await this.CreateDocument();
            }
            if (!this.doc)
                return;
            const fieldInfos = Metadata.Fields.get(this.constructor) ?? [];
            for (const info of fieldInfos) {
                this.loadField(info);
            }
            resolve();
        }));
    }

    /** @internal **/
    protected loadField(info: IFieldInfo) {
        const entityInfo = Metadata.Entities.get(info.Constructor);
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
        await this.ReloadPromise;
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
        this.isSaving = false;
        await this.Reload();
    }


    public async Remove() {
        await Fetch(this.URI, {method: 'DELETE'});
        this.listeners.delete.forEach(f => f(new CustomEvent('delete', {
            detail: this
        })));
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

    public Subscribe(uri: Reference = this.URI) {
        this.GetWebSocket().then(ws => {
            ws.send(`sub ${uri}`);
            ws.onmessage = async message => {
                const [, action, reference] = message.data.match(/(ack|pub) (.*)/);
                switch (action) {
                    case "ack":
                        break;
                    case "pub":
                        break;
                }
                if (!this.isSaving) {
                    await this.Reload();
                    this.listeners.update.forEach(f => f(new CustomEvent('update', {
                        detail: this
                    })));
                }
            }
        })
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
