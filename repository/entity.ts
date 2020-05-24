import {ItemsDocument} from "./document";
import {
    addSubjectValue,
    getSubjectValues,
    IFieldInfo,
    merge,
    Metadata,
    removeSubjectValue,
    setSubjectValue
} from "./metadata";
import {ValuesSet} from "./values-set";
import {BaseDocument} from "./base.document";
import {Reference, TripleSubject} from "tripledoc";
import type {ConstructorOf} from "./solid.repository";
import {rdf} from "rdf-namespaces";


export class SubjectReader {
    public static Read(subject: TripleSubject, fieldInfos: IFieldInfo[]) {
        const result = {};
        for (const info of fieldInfos) {
            if (info.isArray && info.isOrdered) {
                if (!result[info.field])
                    result[info.field] = new ValuesSet([]);
                result[info.field].Load(subject, info);
            } else if (info.isArray){
                result[info.field] = getSubjectValues(subject, info);
            } else {
                result[info.field] = getSubjectValues(subject, info)[0];
            }
        }
        return result;
    }
}

export type EntityConstructor<TEntity> = ConstructorOf<TEntity, ConstructorParameters<typeof Entity>> ;

export class Entity {

    constructor(private subject: TripleSubject, document: BaseDocument) {
        this.Document = document;
        this.Load();
    }

    protected Load() {
        const fieldInfos = Metadata.Fields.get(this.constructor);
        const result = SubjectReader.Read(this.subject, fieldInfos);
        Object.assign(this, result);
        this.Id = this.subject.asRef();
    }

    public Save() {
        const fieldInfos = Metadata.Fields.get(this.constructor);
        for (const info of fieldInfos) {
            const key = info.field;
            const values = getSubjectValues(this.subject, info);
            if (info.isArray) {
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
                if (values[0] != this[key]) {
                    if (this[key] == null)
                        this.subject.removeAll(info.predicate);
                    else if (!values.length)
                        addSubjectValue(this.subject, info, this[key]);
                    else
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
