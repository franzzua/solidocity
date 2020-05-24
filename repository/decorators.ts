import {Constructor, IFieldInfo, Metadata} from "./metadata";
import {Reference} from "../contracts";


export const entityField: (constructor: Constructor, info?: IFieldInfo) => PropertyDecorator
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
