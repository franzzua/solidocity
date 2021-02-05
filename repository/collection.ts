import {Document} from "./document";
import {Metadata} from "./metadata";
import {Entity} from "./entity";
import {document, entity, entitySet, field} from "./decorators";
import {ldp, rdfs, schema} from "rdf-namespaces";
import {Reference} from "../contracts";
import {DocumentSet} from "./document-set";
import {EntitySet} from "./entity-set";
import {authFetch} from "../impl/auth";


@entity(rdfs.Resource)
class DocumentRecord extends Entity {
    @field(schema.dataset)
    public Set: string;
    @field(rdfs.Resource, {type: "ref"})
    public Reference: Reference;
}

@document(rdfs.Container)
class DocumentRecordDocument extends Document {
    @entitySet(DocumentRecord)
    public Records: EntitySet<DocumentRecord>;
}

const contains = 'http://context.app/types#contains';

export class Collection extends Document {

    private Documents: Document[];

    private initPromise: Promise<void> = Promise.resolve();

    constructor(public folderURI) {
        super(`${folderURI}/set.ttl`);
    }

    public async Init() {
        const isExists = await authFetch(this.folderURI, {method: 'HEAD'});
        if (!isExists.ok)
            await fetch(this.folderURI, {
                method: 'POST',
                headers: {
                    link: '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
                    'Content-Type': 'text/turtle'
                }
            });
        const infos = Metadata.DocumentSets.get(this.constructor);
        for (let info of infos) {
            this[info.Field] = new DocumentSet(info.Constructor, this, info.Field)
        }
        await this.Load();
    }

    private async Load() {
        await super.Init();
        this.Documents = [];
        const infos = Metadata.DocumentSets.get(this.constructor);
        for (let info of infos) {
            const subject = this.doc.getSubject(`${this.URI}#${info.Field.toString()}`);
            const refs = subject.getAllRefs(contains);
            for (let ref of refs) {
                const doc = await (this[info.Field] as DocumentSet<any>).Load(ref);
                this.Documents.push(doc);
            }
        }
    }

    /** @internal **/
    public async RegisterDoc(field: string | symbol, doc: Document) {
        const subject = this.doc.getSubject(`${this.URI}#${field.toString()}`)
            ?? this.doc.addSubject({identifier: field.toString()});
        if (!subject.getAllRefs(contains).includes(doc.URI)) {
            subject.addRef(contains, doc.URI);
            await this.doc.save();
        }
        this.Documents.push(doc);
    }

    public async Remove(withFolder = false) {
        const infos = Metadata.DocumentSets.get(this.constructor);
        for (let info of infos) {
            await (this[info.Field] as DocumentSet<any>).Clear();
        }
        await super.Remove();
        withFolder && await fetch(this.folderURI, {method: 'DELETE'});
    }

    public async Unsubscribe() {
        const infos = Metadata.DocumentSets.get(this.constructor);
        for (let info of infos) {
            const documents = (this[info.Field] as DocumentSet<any>).Documents;
            for (let document of documents) {
                await document.Unsubscribe();
            }
        }
        await super.Unsubscribe();
    }
}

