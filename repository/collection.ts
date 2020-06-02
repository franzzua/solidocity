import {Document} from "./document";
import {Metadata} from "./metadata";
import {Entity} from "./entity";
import {entity, entitySet, document, field} from "./decorators";
import {ldp, rdfs, schema} from "rdf-namespaces";
import {Reference} from "../contracts";
import {DocumentSet} from "./document-set";
import {fs} from "../impl/file.service";
import {EntitySet} from "./entity-set";
import {mainEntityOfPage} from "rdf-namespaces/dist/schema";
import {reference} from "rdf-namespaces/dist/sioc";


@entity(rdfs.Resource)
class DocumentRecord extends Entity {
    @field(schema.dataset)
    public Set: string;
    @field(rdfs.Resource, {type: "ref"})
    public Reference: Reference;
}

@document(rdfs.Container)
class DocumentRecordDocument extends Document{
    @entitySet(DocumentRecord)
    public Records: EntitySet<DocumentRecord>;
}

export class Collection extends Document{

    private Documents: Document[];

    private initPromise: Promise<void> = Promise.resolve();

    constructor(public folderURI) {
        super(`${folderURI}/set.ttl`);
    }

    public async Init() {
        if (!await  fs.itemExists(this.folderURI))
            await fs.createFolder(this.folderURI);
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
            const refs = subject.getAllRefs(ldp.contains);
            for(let ref of refs) {
                const doc = await (this[info.Field] as DocumentSet<any>).Load(ref);
                await this.RegisterDoc(info.Field, doc);
            }
        }
    }

    /** @internal **/
    public async RegisterDoc(field: string | symbol, doc: Document) {
        const subject = this.doc.getSubject(`${this.URI}#${field.toString()}`)
            ?? this.doc.addSubject({identifier: field.toString()});
        if (subject.getRef(ldp.contains) !== doc.URI) {
            subject.setRef(ldp.contains, doc.URI);
            await this.doc.save();
        }
        this.Documents.push(doc);
    }

    public async Remove(withFolder = false){
        const infos = Metadata.DocumentSets.get(this.constructor);
        for (let info of infos) {
            await (this[info.Field] as DocumentSet<any>).Clear();
        }
        await super.Remove();
        withFolder && await fs.deleteFolder(this.folderURI);
    }
}

