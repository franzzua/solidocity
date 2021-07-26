import "../core/groupBy";
import {Reference} from "../contracts";
import {DataFactory, Quad_Subject, Triple} from "n3";
import {rdf} from "rdf-namespaces";
import {RdfStore} from "./RdfStore";
import {RdfScalar} from "./values/rdf-scalar";
import {RdfSet} from "./values/rdf-set";
import {RdfLink} from "./values/rdf-link";
import {RdfObject, RdfValueType} from "./values/rdf-object";
import {ArSet} from "./ar-set";
import {applyChange, Change, mergeChanges} from "./change";


export class RdfSubject {

    constructor(public subject: Quad_Subject,
                public triples: Triple[]) {
        // this.ArSet = new ArSet<Triple>(triples);
        this.Type = triples.find(x => x.predicate.value == rdf.type)?.object?.value;
    }

    // public ArSet: ArSet<Triple>;
    //
    // public get triples(): ReadonlyArray<Triple> {
    //     return this.ArSet.Values;
    // }

    public Objects = new Map<Reference, RdfObject<RdfValueType>>();

    public Type: Reference;

    public get URI() {
        return this.subject.value;
    }
    //
    // remove() {
    //     this.ArSet.remove(...this.triples);
    // }
    //
    // /**
    //  * @internal
    //  */
    // replace(oldTriples: ReadonlyArray<Triple>, newTriples: ReadonlyArray<Triple>) {
    //
    //     this.ArSet.remove(...oldTriples);
    //     this.ArSet.add(...newTriples);
    // }

    Set<T extends RdfValueType = RdfValueType>(predicate: string, type): RdfSet<T> {
        if (this.Objects.has(predicate))
            return this.Objects.get(predicate) as RdfSet<T>;
        const set = new RdfSet<T>(this, DataFactory.namedNode(predicate), type);
        this.Objects.set(predicate, set);
        return set;
    }

    Scalar<T extends RdfValueType = RdfValueType>(predicate: string, type): RdfScalar<T> {
        if (this.Objects.has(predicate))
            return this.Objects.get(predicate) as RdfScalar<T>;
        const scalar = new RdfScalar<T>(this, DataFactory.namedNode(predicate), type);
        this.Objects.set(predicate, scalar);
        return scalar;
    }

    public merge(triples: Triple[]): void {

        const unknownChanges = [];
        triples
            .groupBy(x => x.predicate.value)
            .forEach((triples, predicate) => {
                const object = this.Objects.get(predicate);
                if (!object){
                    unknownChanges.push(...triples);
                }else {
                    object.merge(triples);
                }
            });
        // this.ArSet.merge(unknownChanges);
    }

    public getChanges(): Change<Triple> {
        return  mergeChanges([...this.Objects.values()].map(x => x.change));
    }

    public saveChanges(): void {
        this.triples = applyChange(this.getChanges(), this.triples);
        for (let [predicate, object] of this.Objects) {
            object.update()
        }

    }

    public Remove(): void {
        for (let [, object] of this.Objects) {
            object.Remove()
        }
    }
}

