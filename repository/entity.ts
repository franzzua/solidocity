import {ItemsDocument} from "./document";
import {
    IFieldInfo,
    Metadata
} from "./helpers/metadata";
import {ValuesSet} from "./values-set";
import {BaseDocument} from "./base.document";
import {TripleSubject} from "tripledoc";
import {rdf} from "rdf-namespaces";
import {RdfSubject} from "../rdf/RdfDocument";
import {FieldEntitySet} from "./entity-set";
import {Reference} from "../contracts";

/** @internal **/
class SubjectReader {
    public static Read(subject: TripleSubject, fieldInfos: IFieldInfo[]) {
        const result = {};

        return result;
    }
}

export class Entity {
    public Deleted: boolean;

    public get Id() {return this.Subject.URI}

    /** @internal **/
    constructor(
        protected Subject: RdfSubject,
        document: BaseDocument,
        /** @internal **/
        private localSubject?: TripleSubject
    ) {
        this.Document = document;
        this.Load();
    }

    /** @internal **/
    // public get Subject () {
    //    return this.localSubject ?? this.Document.doc.getSubject(this.Id);
    // }

    public Load() {
        const fieldInfos = Metadata.Fields.get(this.constructor);
        for (const info of fieldInfos) {

            if (info.type == "object"){
                if (info.isArray){
                    const refs = this.Subject.getValues(info.predicate, "ref") as Reference[];
                    const subjects = refs.map(ref => this.Document.rdfDoc.getSubject(ref));
                    const set = new FieldEntitySet(this.Document, info.Constructor, this.Subject);
                    set.Load(subjects);
                    this[info.field] = set;
                }else{
                    const ref = this.Subject.getValue(info.predicate, "ref") as Reference;
                    const subj = this.Document.rdfDoc.getSubject(ref);
                    this[info.field] = new info.Constructor(subj, this.Document);
                }
            }else            {
                if (info.isArray && info.isOrdered) {
                    this[info.field] = new ValuesSet(this.Subject, info.predicate, info.type);
                } else if (info.isArray) {
                    this[info.field] = this.Subject.getValues(info.predicate, info.type)
                } else {
                    this[info.field] = this.Subject.getValue(info.predicate, info.type);
                }
            }
        }
    }

    public Save() {
        const fieldInfos = Metadata.Fields.get(this.constructor);
        if (this.Deleted){
            for (const info of fieldInfos) {
                if (info.isArray && info.isOrdered) {
                    (this[info.field] as ValuesSet<any>).Delete()
                }
                // this.Subject.removeAll(info.predicate);
            }
            // this.Subject.removeAll(rdf.type);
            // this.Document.doc.removeSubject(this.Id);
            this.Subject.remove()
            return;
        }
        for (const info of fieldInfos) {
            const key = info.field;
            if (info.type == "object") {
                // could not process objects in entity yet
                continue;
            }
            if (info.isArray && info.isOrdered) {
                (this[info.field] as ValuesSet<any>).Save();
            } else if (info.isArray) {
                this.Subject.setValues(info.predicate, info.type, this[key]);
            } else {
                    this.Subject.setValue(info.predicate, info.type, this[key]);
            }
        }
        const currentType = Metadata.Entities.get(this.constructor).TypeReference;
        if (this.Subject.getValue(rdf.type, "ref") != currentType)
            this.Subject.setValue(rdf.type, "ref", currentType);
    }

    public Assign(data: Omit<this, keyof Entity>) {

    }

    public Remove() {
        this.Deleted = true;
        this.Save();
        //const fieldInfos = Metadata.Fields.get(this.constructor);
        //for (const info of fieldInfos) {
        //}
    }

    Document: BaseDocument;
}


export type ConstructorOf<T, Params extends Array<any>> = {
    new(...args: Params): T;
}

export type EntityConstructor<TEntity> = ConstructorOf<TEntity, ConstructorParameters<typeof Entity>> ;
