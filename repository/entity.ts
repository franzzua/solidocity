import {ItemsDocument} from "./document";
import {
    IFieldInfo,
    Metadata
} from "./helpers/metadata";
import {ValuesSet} from "./values-set";
import {BaseDocument} from "./base.document";
import {rdf} from "rdf-namespaces";
import {FieldEntitySet} from "./entity-set";
import {Reference} from "../contracts";
import {RdfSubject} from "../rdf/RdfSubject";

export class Entity {
    public Deleted: boolean;
    Document: BaseDocument;

    public get Id() {return this.Subject.URI}

    /** @internal **/
    constructor(
        /** @internal **/
        public Subject: RdfSubject,
        document: BaseDocument,
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
            const subjects = this.Subject.Link(info.predicate).get();
            if (info.type == "object"){
                if (info.isArray){
                    const set = new FieldEntitySet(this.Document, info.Constructor, this.Subject, info.predicate);
                    set.Load(subjects);
                    this[info.field] = set;
                }else{
                    const subject = subjects[0] ?? this.Subject.Link(info.predicate).add()
                    this[info.field] = new info.Constructor(subject, this.Document);
                }
            }else            {
                if (info.isArray && info.isOrdered) {
                    this[info.field] = new ValuesSet(this.Subject, info.predicate, info.type);
                } else if (info.isArray) {
                    this[info.field] = this.Subject.Set(info.predicate, info.type).get();
                } else {
                    this[info.field] = this.Subject.Scalar(info.predicate, info.type).get();
                }
            }
        }
    }

    public Save() {
        const fieldInfos = Metadata.Fields.get(this.constructor);
        if (this.Deleted){
            this.Subject.remove()
            return;
        }
        for (const info of fieldInfos) {
            const key = info.field;
            if (info.type == "object") {
                if (info.isArray){
                    this.Subject.Link(info.predicate).set((this[info.field] as FieldEntitySet<Entity>).Items.map(x => x.Subject));
                }else{
                    this.Subject.Link(info.predicate).set( [(this[info.field] as Entity).Subject]);
                }
                continue;
            }
            if (info.isArray && info.isOrdered) {
                (this[info.field] as ValuesSet<any>).Save();
            } else if (info.isArray) {
                this.Subject.Set(info.predicate, info.type).set(this[key]);
            } else {
                this.Subject.Scalar(info.predicate, info.type).set(this[key]);
            }
        }
        const currentType = Metadata.Entities.get(this.constructor).TypeReference;
        this.Subject.Scalar(rdf.type, "ref").set(currentType);
    }

    public Remove() {
        this.Deleted = true;
        this.Save();
    }

    public Merge(other: Omit<this, keyof Entity>){
        Object.apply(this, other);
    }

}


export type ConstructorOf<T, Params extends Array<any>> = {
    new(...args: Params): T;
}

export type EntityConstructor<TEntity> = ConstructorOf<TEntity, ConstructorParameters<typeof Entity>> ;
