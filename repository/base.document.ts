import {IFieldInfo, Metadata} from "./helpers/metadata";
import {EntitySet} from "./entity-set";
import {Reference} from "../contracts";
import {authFetch} from "../impl/auth";
import {RdfDocument} from "../rdf/RdfDocument";
import {Entity} from "./entity";
import {RdfSubject} from "../rdf/RdfSubject";
import {RdfLink} from "../rdf/values/rdf-link";
import {HttpRdfRepository} from "../rdf/http/http.rdf-repository";

export abstract class BaseDocument {
    /** @internal **/
        // public doc: TripleDocument;

    private httpRepository = new HttpRdfRepository(this.URI);
    public rdfDoc = new RdfDocument(this.httpRepository);

    constructor(public URI: Reference) {
        this.URI = this.URI.split('#')[0];
        this.InitMetadata();
    }

    private InitMetadata() {
        const fieldInfos = Metadata.Fields.get(this.constructor) ?? [];
        for (const info of fieldInfos) {
            if (info.isArray) {
                this[info.field] = new EntitySet(this.rdfDoc, info.Constructor);
            }
        }
    }

    public async Init() {
        await this.rdfDoc.Load();
        this.loadFields();
    }

    protected loadFields() {
        const fieldInfos = Metadata.Fields.get(this.constructor) ?? [];
        for (const info of fieldInfos) {
            const entityInfo = Metadata.Entities.get(info.Constructor);
            if (info.isArray) {
                const subjects = this.rdfDoc.getSubjectsOfType(entityInfo.TypeReference);
                (this[info.field] as EntitySet<any>).Load(subjects ?? []);
            } else {
                const subject = this.rdfDoc.getSubject(`${this.URI}${info.id}`)
                if (!this[info.field]) {
                    this[info.field] = new info.Constructor(subject, this.rdfDoc);
                } else {
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

    public async Subscribe(uri: Reference = this.URI, cb?: () => void): Promise<void> {
        this.Unsubscribe = await this.rdfDoc.Subscribe(() => {
            this.loadFields();
            cb && cb();
        });
    }

    public Unsubscribe(){

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
