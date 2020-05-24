import { SolidEngine, SolidModel } from 'soukai-solid';
import {fetch} from'solid-auth-cli';
import {FieldType} from 'soukai';
import Soukai from 'soukai';

Soukai.useEngine(new SolidEngine(fetch));


export const SoukaiModel: (name) => ClassDecorator = name => (target: any) => Soukai.loadModel(name, target);

export const SoukaiField: (name) => PropertyDecorator = (name) => (target: {constructor}, key) => {
    if (target.constructor.fields == null)
        target.constructor.fields = [];
    target.constructor.fields.push({
        [key]: {
            type: FieldType.String,
            rdfProperty: name
        }
    })
};

export {
    SolidModel
}
