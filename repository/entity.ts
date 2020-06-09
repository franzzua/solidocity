import {ItemsDocument} from "./document";
import {
    IFieldInfo,
    Metadata
} from "./metadata";
import {ValuesSet} from "./values-set";
import {BaseDocument} from "./base.document";
import {TripleSubject} from "tripledoc";
import {Reference} from "../contracts";
import {rdf} from "rdf-namespaces";
import {EntitySet, FieldEntitySet} from "./entity-set";
import {
    addSubjectValue,
    getSubjectValue,
    getSubjectValues,
    merge,
    removeSubjectValue,
    setSubjectValue
} from "./subject.ext";

/** @internal **/
class SubjectReader {
    public static Read(subject: TripleSubject, fieldInfos: IFieldInfo[]) {
        const result = {};

        return result;
    }
}

export class Entity {
    public Deleted: boolean;

    /** @internal **/
    constructor(
        public Id: Reference,
        document: BaseDocument,
        /** @internal **/
        private localSubject?: TripleSubject
    ) {
        this.Document = document;
        this.Load();
    }

    /** @internal **/
    public get Subject () {
       return this.localSubject ?? this.Document.doc.getSubject(this.Id);
    }

    public Load() {
        const fieldInfos = Metadata.Fields.get(this.constructor);
        for (const info of fieldInfos) {

            if (info.type == "object"){
                if (info.isArray){
                    const subjects = this.Subject.getAllLocalSubjects(info.predicate);
                    const set = new FieldEntitySet(this.Document, info.Constructor, this.Subject);
                    set.Load(subjects);
                    this[info.field] = set;
                }else{
                    const subj = this.Subject.getLocalSubject(info.predicate);
                    this[info.field] = new info.Constructor(subj, this.Document);
                }
            }else {
                if (info.isArray && info.isOrdered) {
                    this[info.field] = new ValuesSet(this.Document, this.Id, info);
                } else if (info.isArray) {
                    this[info.field] = getSubjectValues(this.Subject, info);
                } else {
                    this[info.field] = getSubjectValue(this.Subject, info);
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
                this.Subject.removeAll(info.predicate);
            }
            this.Subject.removeAll(rdf.type);
            this.Document.doc.removeSubject(this.Id);
            return;
        }
        for (const info of fieldInfos) {
            const key = info.field;
            if (info.isArray && info.isOrdered) {
                (this[info.field] as ValuesSet<any>).Save();
            } else if (info.isArray) {
                const values = getSubjectValues(this.Subject, info);
                const newItems = this[key];
                if (!newItems || !newItems.length) {
                    this.Subject.removeAll(info.predicate);
                } else {
                    merge(newItems.orderBy(x => x), values,
                        newValue => addSubjectValue(this.Subject, info, newValue),
                        updValue => setSubjectValue(this.Subject, info, updValue),
                        newValue => removeSubjectValue(this.Subject, info, newValue),
                    );
                }
            } else {
                const value = getSubjectValue(this.Subject, info);
                if (!info.equal(value, this[key])){
                    setSubjectValue(this.Subject, info, this[key]);
                }
            }
        }
        const currentType = Metadata.Entities.get(this.constructor).TypeReference;
        this.Subject.setRef(rdf.type, currentType);
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
