import {RdfObject, RdfValueType} from "./rdf-object";
import {BlankNode, DataFactory, Quad_Predicate, Triple} from "n3";
import {predicate} from "rdf-namespaces/dist/rdf";
import {RdfSubject} from "../RdfSubject";
import {RdfStore} from "../RdfStore";
import {applyChange} from "../change";

export class RdfLink extends RdfObject<RdfValueType> {

    constructor(protected store: RdfStore,
                protected subject: RdfSubject,
                protected predicate: Quad_Predicate) {
        super(subject, predicate, "ref");
    }

    private value = applyChange(this.change, this.triples)
        .filter(x => x.predicate.equals(this.predicate))
        .filter(x => x.object.termType == "BlankNode")
        .map(x => x.object as BlankNode)
        .map(x => this.store.get(x));

    get(): RdfSubject[] {
        return this.value;
    }

    set(subjects: RdfSubject[]) {
        const deleted = this.triples.filter(x => !subjects
            .some(y => x.object.equals(y.subject)));
        const added = subjects.filter(x => !this.triples.some(y => y.object.equals(x.subject)));
        this.change.remove = [
            ...this.change.remove,
            ...deleted
        ];
        this.change.add = [
            ...this.change.add,
            ...added.map(x => this.toTriple(x.subject))
        ];
        this.value = subjects;
    }

    public add(): RdfSubject {
        const blankNode = DataFactory.blankNode();
        this.change.add = [
            ...this.change.add,
            this.toTriple(blankNode)
        ];
        const newSubject = new RdfSubject(blankNode, []);
        this.store.add(newSubject);
        this.value.push(newSubject);
        return newSubject;
    }

    public remove(subject: RdfSubject): void {
        const toRemove = this.triples.filter(x => x.predicate.value == predicate && x.object.equals(subject.subject));
        this.value.removeAll([subject], (x,y) => x.subject.equals(y.subject));
        this.change.remove = [
            ...this.change.remove,
            ...toRemove
        ];
    }

    public merge(triples: Array<Triple>): void {
        throw new Error("not implemented");
    }
}
