import {Reference, TripleSubject} from "tripledoc";

export type Constructor = any;

export class Metadata {
    public static Documents = new Map<Constructor, IDocumentInfo>();
    public static Entities = new Map<Constructor, IEntityInfo>();
    public static Fields = new Map<Constructor, IFieldInfo[]>();

    public static addDocument(target, reference: Reference,) {
        this.Documents.set(target, {
            TypeReference: reference
        })
    }

    public static addField(target: { constructor }, key, predicate: Reference, info?: IFieldInfo) {
        this.Fields.set(target.constructor, [
            ...(this.Fields.get(target.constructor) ?? []),
            {
                ...info,
                field: key,
                predicate,
            }
        ]);
    }

    public static addEntityField(target: { constructor }, key, constructor, isArray) {
        this.Fields.set(target.constructor, [
            ...(this.Fields.get(target.constructor) ?? []),
            {
                Constructor: constructor,
                field: key,
                isArray,
                type: "object"
            }
        ]);
    }

    public static addEntity(target: { constructor }, reference: Reference) {
        this.Entities.set(target, {
            TypeReference: reference
        })
    }
}

export interface IFieldInfo {
    field?: string;
    Constructor?: Constructor;
    predicate?: Reference;
    isArray?: boolean;
    isOrdered?: boolean;
    type?: 'string' | 'Date' | 'ref' | 'decimal' | 'object';
}

export interface IDocumentInfo {
    TypeReference: Reference;
}

export interface IEntityInfo {
    TypeReference: Reference;
}

export function merge<T>(from: T[], to: T[], onCreate: (t: T) => void, onUpdate: (t: T) => void, onDelete: (t: T) => void) {
    const minLength = Math.min(from.length, to.length);
    for (let i = 0; i < minLength; i++) {
        if (from[i] != to[i]) {
            onUpdate(from[i]);
        }
    }
    for (let i = minLength; i < from.length; i++) {
        onCreate(from[i]);
    }
    for (let i = minLength; i < to.length; i++) {
        onDelete(to[i]);
    }
}

export function removeSubjectValue(subject: TripleSubject, info: IFieldInfo, value) {
    switch (info.type) {
        case "string":
            return subject.removeString(info.predicate, value);
        case "Date":
            return subject.removeDateTime(info.predicate, value);
        case "ref":
            return subject.removeRef(info.predicate, value);
        case "decimal":
            return subject.removeDecimal(info.predicate, value);
    }
}

export function addSubjectValue(subject: TripleSubject, info: IFieldInfo, value) {
    switch (info.type) {
        case "string":
            return subject.addString(info.predicate, value);
        case "Date":
            return subject.addDateTime(info.predicate, value);
        case "ref":
            return subject.addRef(info.predicate, value);
        case "decimal":
            return subject.addDecimal(info.predicate, value);
    }
}

export function setSubjectValue(subject: TripleSubject, info: IFieldInfo, value) {
    switch (info.type) {
        case "string":
            return subject.setString(info.predicate, value);
        case "Date":
            return subject.setDateTime(info.predicate, value);
        case "ref":
            return subject.setRef(info.predicate, value);
        case "decimal":
            return subject.setDecimal(info.predicate, value);
    }
}

/**
 * Возвращает все упорядоченные значения @param subject
 * @param subject
 * @param info
 */
export function getSubjectValues(subject: TripleSubject, info: IFieldInfo): (string | Date | Reference | number)[] {
    switch (info.type) {
        case "string":
            return subject.getAllStrings(info.predicate).orderBy(x => x);
        case "Date":
            return subject.getAllDateTimes(info.predicate).orderBy(x => +x);
        case "ref":
            return subject.getAllRefs(info.predicate).orderBy(x => x);
        case "decimal":
            return subject.getAllDecimals(info.predicate).orderBy(x => x);
    }
}


