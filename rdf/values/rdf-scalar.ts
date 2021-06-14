import {RdfObject, RdfValueType} from "./rdf-object";

export class RdfScalar<T extends RdfValueType> extends RdfObject<T> {
    get(): T {
        if (this.triples.length == 0)
            return null;
        return this.toJS(this.triples[0].object);
    }

    set(value: T) {
        if (value == null && this.triples.length == 0)
            return;
        if (value == this.get())
            return;
        this.subject.replace(this.triples, [this.toTriple(value)]);
    }
}
