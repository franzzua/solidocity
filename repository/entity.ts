import {ItemsDocument} from "./document";
import {
    addSubjectValue, getSubjectValue,
    getSubjectValues,
    IFieldInfo,
    merge,
    Metadata,
    removeSubjectValue,
    setSubjectValue
} from "./metadata";
import {ValuesSet} from "./values-set";
import {BaseDocument} from "./base.document";
import {TripleSubject} from "tripledoc";
import {Reference} from "../contracts";
import {rdf} from "rdf-namespaces";
import {EntitySet, FieldEntitySet} from "./entity-set";

/** @internal **/
class SubjectReader {
    public static Read(subject: TripleSubject, fieldInfos: IFieldInfo[]) {
        const result = {};

        return result;
    }
}

export class Entity {

    /** @internal **/
    constructor(protected subject:TripleSubject, document: BaseDocument) {
        this.Document = document;
        this.Load();
    }

    protected Load() {
        const fieldInfos = Metadata.Fields.get(this.constructor);
        for (const info of fieldInfos) {
            if (info.type == "object"){
                if (info.isArray){
                    const subjects = this.subject.getAllLocalSubjects(info.predicate);
                    const set = new FieldEntitySet(this.Document, info.Constructor, this.subject);
                    set.Load(subjects);
                    this[info.field] = set;
                }else{
                    const subj = this.subject.getLocalSubject(info.predicate);
                    this[info.field] = new info.Constructor(subj, this.Document);
                }
            }else {
                if (info.isArray && info.isOrdered) {
                    this[info.field] = new ValuesSet(this.subject, info);
                } else if (info.isArray) {
                    this[info.field] = getSubjectValues(this.subject, info);
                } else {
                    this[info.field] = getSubjectValue(this.subject, info);
                }
            }
        }
        this.Id = this.subject.asRef();
    }

    public Save() {
        const fieldInfos = Metadata.Fields.get(this.constructor);
        for (const info of fieldInfos) {
            const key = info.field;
            if (info.isArray) {
                const values = getSubjectValues(this.subject, info);
                const newItems = this[key];
                if (!newItems || !newItems.length) {
                    this.subject.removeAll(info.predicate);
                } else {
                    merge(newItems.orderBy(x => x), values,
                        newValue => addSubjectValue(this.subject, info, newValue),
                        updValue => setSubjectValue(this.subject, info, updValue),
                        newValue => removeSubjectValue(this.subject, info, newValue),
                    );
                }
            } else {
                const value = getSubjectValue(this.subject, info);
                if (value != this[key]) {
                    if (this[key] == null)
                        this.subject.removeAll(info.predicate);
                    setSubjectValue(this.subject, info, this[key]);
                }
            }
        }
        const currentType = Metadata.Entities.get(this.constructor).TypeReference;
        this.subject.setRef(rdf.type, currentType);
    }

    public Assign(data: Omit<this, keyof Entity>) {

    }

    public async Remove() {
        await this.Document.Save();
    }

    Id: Reference;
    Document: BaseDocument;
}


export type ConstructorOf<T, Params extends Array<any>> = {
    new(...args: Params): T;
}

export type EntityConstructor<TEntity> = ConstructorOf<TEntity, ConstructorParameters<typeof Entity>> ;
