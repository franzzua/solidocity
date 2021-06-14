import {DataFactory, Quad_Subject, Term, Triple} from "n3";
import {RdfStore} from "../RdfStore";
import {Change} from "../change";
import {ArSet} from "../ar-set";

export class PersistanceStore {

    public Triples: ArSet<Triple> = new ArSet<Triple>([]);

    public async Load(): Promise<Triple[]> {
        return this.Triples.Values;
    }

    public save(change: Change<Triple>): void {
        this.Triples.add(...change.add);
        this.Triples.remove(...change.remove);
    }

    public merge(triples: Triple[]): void {
        this.Triples.merge(triples);
    }
}
