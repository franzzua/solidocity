import {IRdfRepository} from "../../rdf/RdfDocument";
import {Triple} from "n3";
import { Change } from "rdf/change";

export class MockRdfRepository implements IRdfRepository{

    constructor(private initial: Triple[]) {

    }

    private listeners: ((triples: ReadonlyArray<Triple>) => void)[] = [];

    public async Subscribe(listener: (triples: ReadonlyArray<Triple>) => void): Promise<() => void> {
        this.listeners.push(listener);
        return () => {
            this.listeners.removeAll([listener]);
        };
    }

    public getAclRef() {
    }

    public async load(): Promise<ReadonlyArray<Triple>> {
        return this.initial;
    }

    public async saveChanges(change: Change<Triple>): Promise<void> {
        if (!change.remove.every(x => this.initial.some(y => x.equals(y)))){
            throw new Error();
        }
        this.initial.removeAll(change.remove, (x,y) => x.equals(y));
        this.initial.push(...change.add);

        for (let listener of this.listeners) {
            listener(this.initial);
        }
    }

}
