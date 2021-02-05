import {Constructor, ICollectionInfo, IDocumentSetInfo, IFieldInfo, Metadata} from "./metadata";
import {Reference} from "../contracts";


export const entitySet: (constructor: Constructor, info?: IFieldInfo) => PropertyDecorator
    = (constructor, info = {}) => (target: { constructor }, key: string) => {
    Metadata.addEntityField(target, key, constructor, info);
};

export const document: (reference?: Reference) => ClassDecorator
    = (reference) => (target: { constructor }) => {
    Metadata.addDocument(target, reference);
};

export const entity: (reference?: Reference) => ClassDecorator
    = (reference) => (target: { constructor }) => {
    Metadata.addEntity(target, reference);
};

export const field: (reference: Reference, info?: IFieldInfo) => PropertyDecorator
    = (reference, info = {type: "string"}) => (target, key: string | symbol) => {
    Metadata.addField(target, key, reference, info);
};
export const valuesSet: (reference: Reference, info?: IFieldInfo) => PropertyDecorator
    = (reference, info = {type: "string"}) => (target, key: string | symbol) => {
    Metadata.addField(target, key, reference, {
        ...info,
        isArray: true,
        isOrdered: true
    });
};

export const collection: (info?: ICollectionInfo) => ClassDecorator = (info: ICollectionInfo) => target => {
    Metadata.Collections.set(target.constructor, info ?? {

    })
}


export const documentSet: (constructor: Function, info?: IDocumentSetInfo) => PropertyDecorator = (constructor, info: IDocumentSetInfo) => (target, key) => {
    Metadata.DocumentSets.set(target.constructor, [
        {
            ...info,
            Constructor: constructor,
            Field: key
        },
        ...(Metadata.DocumentSets.get(target.constructor) ?? [])
    ])
}
