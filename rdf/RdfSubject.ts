import {Reference} from "../contracts";
import {Quad_Subject, Triple} from "n3";
import {rdf} from "rdf-namespaces";
import {RdfStore} from "./RdfStore";
import {RdfScalar} from "./values/rdf-scalar";
import {RdfSet} from "./values/rdf-set";
import {RdfLink} from "./values/rdf-link";
import {RdfValueType} from "./values/rdf-object";
import {ArSet} from "./ar-set";
import {Change} from "./change";


export class RdfSubject {

    constructor(public store: RdfStore,
                public subject: Quad_Subject,
                triples: Triple[]) {
        this.Type = this.triples.find(x => x.predicate.value == rdf.type)?.object?.value;
        this.ArSet = new ArSet<Triple>(triples);
    }

    public ArSet: ArSet<Triple>;

    public get triples(): ReadonlyArray<Triple> {
        return this.ArSet.Values;
    }

    public Type: Reference;

    public get URI() {
        return this.subject.value;
    }

    remove() {
        this.ArSet.remove(...this.triples);
    }

    /**
     * @internal
     */
    replace(oldTriples: Triple[], newTriples: Triple[]) {
        this.ArSet.remove(...oldTriples);
        this.ArSet.add(...newTriples);
    }

    Set<T extends RdfValueType = RdfValueType>(predicate, type): RdfSet<T> {
        return new RdfSet<T>(this, predicate, type);
    }

    Scalar<T extends RdfValueType = RdfValueType>(predicate, type): RdfScalar<T> {
        return new RdfScalar<T>(this, predicate, type);
    }

    Link(predicate) {
        return new RdfLink(this, predicate);
    }

    public merge(triples: Triple[]): void {
        this.ArSet.merge(triples);
    }

    public getChanges(): Change<Triple> {
        return this.ArSet.getChanges();
    }
}

