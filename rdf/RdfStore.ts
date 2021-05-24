import {DataFactory, Quad_Subject, Term, Triple} from "n3";
import {RdfSubject} from "./RdfSubject";
import {Reference} from "../contracts";
import {returns} from "rdf-namespaces/dist/hydra";

export class RdfStore {
    constructor() {
    }

    triples: Map<Quad_Subject, Triple[]> = new Map();
    public Subjects: Map<Quad_Subject, RdfSubject> = new Map();

    merge(triples: Triple[]){
        this.triples = triples.groupBy(x => x.subject);
        this.Subjects = new Map(
            [...this.triples.keys()].map(key => [key, new RdfSubject(key, this)])
        );
    }

    create(uri){
        const term = DataFactory.namedNode(uri);
        const tripleSubject = new RdfSubject(term, this);
        this.Subjects.set(term, tripleSubject);
        return tripleSubject;
    }

    add(triples: Triple[]){
        this.changes.add.push(...triples);
        for (let triple of triples) {
            const ref = triple.subject;
            if (!this.triples.has(ref))
                this.triples.set(ref, [triple]);
            else
                this.triples.get(ref).push(triple);
        }
    }

    remove(triples: Triple[]){
        this.changes.delete.push(...triples);
        for (let [subj, array] of triples.groupBy(x => x.subject)) {
            this.triples.get(subj).remove(array, triplesComparer);
        }
    }

    removeAll(uri: Reference) {
        const key = [...this.triples.keys()].find(x=> x.value == uri);
        this.changes.delete.push(...this.triples.get(key));
        this.triples.delete(key);
    }

    getChanges() {
        const added = [...this.changes.add];
        this.changes.add.remove(this.changes.delete, (a,b) => a.equals(b));
        this.changes.delete.remove(added, (a,b) => a.equals(b));
        const changes = this.changes;
        this.changes = {add: [], delete: []};
        return changes;
    }

    private changes: {
        add: Triple[];
        delete: Triple[];
    } = {
        add: [],
        delete: []
    };

    public getSubject(x: Quad_Subject): RdfSubject {
        const equal = this.Subjects.get(x);
        if (equal) return equal;
        const same = [...this.Subjects].find(([key,value]) => key.equals(x));
        if (same) return same[1];
        return new RdfSubject(x, this);
    }
}

const triplesComparer = (a: Triple, b: Triple) =>
    a.subject.value == b.subject.value
    &&  a.predicate.value == b.predicate.value
    &&  a.object.value == b.object.value;
