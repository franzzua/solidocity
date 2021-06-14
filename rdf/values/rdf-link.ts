import {RdfObject, RdfValueType} from "./rdf-object";
import {BlankNode, DataFactory, Quad_Predicate} from "n3";
import {predicate} from "rdf-namespaces/dist/rdf";
import {RdfSubject} from "../RdfSubject";

export class RdfLink extends RdfObject<RdfValueType> {

    constructor(protected subject: RdfSubject,
                protected predicate: Quad_Predicate) {
        super(subject, predicate, "ref");
    }

    get(): RdfSubject[] {
        return this.triples
            .filter(x => x.predicate.value == predicate)
            .filter(x => x.object.termType == "BlankNode")
            .map(x => x.object as BlankNode)
            .map(x => this.subject.store.get(x));
    }

    set(subjects: RdfSubject[]) {
        const deleted = this.triples.filter(x => !subjects
            .some(y => x.object.equals(y.subject)));
        const added = subjects.filter(x => !this.triples.some(y => y.object.equals(x.subject)));
        this.subject.replace(deleted, added.map(x => this.toTriple(x.subject)));
    }

    public add(): RdfSubject {
        const blankNode = DataFactory.blankNode();
        this.subject.replace([], [this.toTriple(blankNode)]);
        const newSubject = new RdfSubject(this.subject.store, blankNode, []);
        this.subject.store.add(newSubject);
        return newSubject;
    }

    public remove(subject: RdfSubject): void {
        const toRemove = this.triples.filter(x => x.predicate.value == predicate && x.object.equals(subject.subject));
        this.subject.replace(toRemove, []);
    }
}
