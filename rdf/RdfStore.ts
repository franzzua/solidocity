import {DataFactory, Quad_Subject, Term, Triple} from "n3";
import {RdfSubject} from "./RdfSubject";
import {PersistanceStore} from "./persistance/persistance.store";

export class RdfStore {
    constructor() {

    }

    public readonly Subjects: RdfSubject[] = [];

    merge(allTriples: Triple[]) {
        const grouped = [...allTriples.groupBy(x => x.subject)];
        for (const [subject, triples] of grouped) {
            const existed = this.get(subject);
            if (existed)
                existed.merge(triples);
            else
                this.add(new RdfSubject(this, subject, triples));
        }
    }

    create(uri) {
        const term = DataFactory.namedNode(uri);
        const tripleSubject = new RdfSubject(this, term, []);
        this.Subjects.push(tripleSubject);
        return tripleSubject;
    }

    get(subject: Quad_Subject): RdfSubject {
        return this.Subjects.find(x => x.subject.equals(subject));
    }

    add(subject: RdfSubject) {
        this.Subjects.push(subject);
    }


    getTriples(): Triple[] {
        return this.Subjects.flatMap(x => x.ArSet.Values);
    }

    getChanges(): {add: Triple[], remove: Triple[]} {
        // const changes = this.changes.getAll();
        // this.changes = new ChangesStore();
        const changes = this.Subjects.map(x => x.getChanges());

        return {
            add: changes.flatMap(x => x.add),
            remove: changes.flatMap(x => x.remove),
        }
    }

    // private changes = new ChangesStore();

    public getOrAdd(x: Quad_Subject): RdfSubject {
        const equal = this.get(x);
        if (equal) return equal;
        const newSubject = new RdfSubject(this, x, []);
        this.add(newSubject);
        return  newSubject;
    }
}

// class ChangesStore {
//     protected add: Triple[] = [];
//     protected delete: Triple[] = [];
//
//     pushAdd(...triples: Triple[]) {
//         this.add.push(...triples);
//     }
//
//     pushDelete(...triples: Triple[]) {
//         this.delete.push(...triples);
//     }
//
//     getAll() {
//         const added = [...this.add];
//         this.add.remove(this.delete, (a, b) => a.equals(b));
//         this.delete.remove(added, (a, b) => a.equals(b));
//     }
// }

const triplesComparer = (a: Triple, b: Triple) =>
    a.subject.value == b.subject.value
    && a.predicate.value == b.predicate.value
    && a.object.value == b.object.value;
