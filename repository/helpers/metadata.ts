import '../../core/orderBy';
import {Reference} from "../../contracts";
import { Entity } from '../entity';
import {RdfSubject} from "../../rdf/RdfSubject";
import {RdfDocSpec} from "../../tests/rdf/rdf-doc.spec";
import {RdfDocument} from "../../rdf/RdfDocument";

export type Constructor = any;


export class Metadata {
    public static Documents = new Map<Constructor, IDocumentInfo>();
    public static Entities = new Map<Constructor, IEntityInfo>();
    public static Fields = new Map<Constructor, IFieldInfo[]>();
    public static Collections = new Map<Constructor, ICollectionInfo>();
    public static DocumentSets = new Map<Constructor, IDocumentSetInfo[]>();

    public static addDocument(target, reference: Reference) {
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
                equal: info.type == "Date" ? (x, y) => +x == +y : (x, y) => x == y
            }
        ]);
    }

    public static addEntityField(target: { constructor }, key, constructor, info: IFieldInfo) {
        this.Fields.set(target.constructor, [
            ...(this.Fields.get(target.constructor) ?? []),
            {
                ...info,
                Constructor: constructor,
                field: key,
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
    id?: string;
    field?: string;
    Constructor?: new (subject: RdfSubject, doc: RdfDocument) => Entity;
    predicate?: Reference;
    isArray?: boolean;
    isOrdered?: boolean;
    type?: 'string' | 'Date' | 'ref' | 'decimal' | 'object';

    equal?(value: string | Date | number, param2: string | Date | number): boolean;
}

export interface IDocumentSetInfo {
    Constructor: Constructor;
    Field: string | symbol;
}

export interface ICollectionInfo {

}

export interface IDocumentInfo {
    TypeReference: Reference;
}

export interface IEntityInfo {
    TypeReference: Reference;
}



