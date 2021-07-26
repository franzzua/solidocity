import {RdfObject, RdfValueType} from "./rdf-object";
import {Triple} from "n3";
import {diffArrays} from "./rdf-set";

export class RdfScalar<T extends RdfValueType> extends RdfObject<T> {

    current = this.toJS(this.triples[0]?.object)

    get(): T {
        return this.current;
    }

    set(value: T) {
        if (value == null && this.triples.length == 0)
            return;
        if (this.toRDF(value).equals(this.toRDF(this.current)))
            return;
        if (this.change.add.length == 0)
            this.change.remove = this.triples;
        this.change.add = [this.toTriple(value)];
        this.current = value;
    }


    public merge(triples: Array<Triple>): void {
        // local changes are absent
        if (this.change.add.length == 0 && this.change.remove.length == 0) {
            this.triples = triples;
            return;
        }
        // remote state same as initial
        if (this.triples.length == 0 && triples.length == 0
            || this.triples[0]?.equals(triples[0])) {
            return;
        }
        this.conflict = {
            initial: this.toJS(this.triples[0]?.object),
            localChange: {
                add: this.change.add.map(x => this.toJS(x.object)),
                remove: this.change.remove.map(x => this.toJS(x.object)),
            },
            remote: this.toJS(triples[0]?.object),
            resolve: value => {
                this.conflict = null;
                this.triples = triples;
                const newTriples = [this.toTriple(value)];
                this.change = diffArrays(this.triples, newTriples);
            }
        };
    }

}

export class ConflictError<T> extends Error {
    constructor(message, public variants: T[]) {
        super(message);
    }


}
