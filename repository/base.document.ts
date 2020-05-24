import {Metadata} from "./metadata";
import {EntitySet} from "./entity-set";
import {TripleDocument, fetchDocument} from "tripledoc";
import {Reference} from "../contracts";

export abstract class BaseDocument {
    /** @internal **/
    public doc: TripleDocument;

    constructor(public URI: Reference) {

    }

    public async Init() {
        const fieldInfos = Metadata.Fields.get(this.constructor) ?? [];
        for (const info of fieldInfos) {
            if (info.isArray){
                this[info.field] = new EntitySet(this, info.Constructor);
            }
        }
        try {
            this.doc = await fetchDocument(this.URI);
        } catch (e) {
            this.doc = await this.CreateDocument();
        }
        if (!this.doc)
            return ;
        for (const info of fieldInfos) {
            const entityInfo = Metadata.Entities.get(info.Constructor);
            const subjects = this.doc.getAllSubjectsOfType(entityInfo.TypeReference);
            if (info.isArray) {
                (this[info.field] as EntitySet<any>).Load(subjects ?? []);
            } else {
                this[info.field] = new info.Constructor(subjects[0] ?? this.doc.addSubject(), this);
            }
        }
    }

    /** @internal **/
    protected abstract async CreateDocument(): Promise<TripleDocument>;

    public async Save() {
        await this.doc.save();
    }
}
